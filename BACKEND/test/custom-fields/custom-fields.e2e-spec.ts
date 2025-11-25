import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';

import { AppModule } from '../../src/app.module';
import { DATABASE_CONNECTION } from '../../src/database/database.module';
import { JwtAuthGuard } from '../../src/auth/jwt-auth.guard';
import { RoleGuard } from '../../src/auth/role.guard';

describe('CustomFields (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let db: Db;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    const client = await MongoClient.connect(uri);
    db = client.db('opsafe_test');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const request = context.switchToHttp().getRequest();

          request.user = {
            id: 'test-user-id',
            role: 'admin',
            organizationId: 'test-org-id',
            email: 'test@example.com',
          };

          return true;
        },
      })
      .overrideGuard(RoleGuard)
      .useValue({ canActivate: () => true })
      .overrideProvider(DATABASE_CONNECTION)
      .useValue(db)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    if (mongod) await mongod.stop();
  });

  const createOrganization = async () => {
    const response = await request(app.getHttpServer())
      .post('/organizations')
      .send({
        name: 'Org Custom Fields',
        status: 'active',
      })
      .expect(201);

    return response.body.id as string;
  };

  it('POST /organizations/:orgId/custom-fields → deve criar um campo customizado', async () => {
    const organizationId = await createOrganization();

    const response = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/custom-fields`)
      .send({
        targetCollection: 'equipments',
        fieldKey: 'riskLevel',
        label: 'Nível de Risco',
        dataType: 'select',
        required: true,
        options: ['Baixo', 'Médio', 'Alto'],
        helpText: 'Classificação de risco operacional do equipamento',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.organizationId).toBe(organizationId);
    expect(response.body.targetCollection).toBe('equipments');
    expect(response.body.fieldKey).toBe('riskLevel');
    expect(response.body.label).toBe('Nível de Risco');
    expect(response.body.dataType).toBe('select');
    expect(response.body.required).toBe(true);
    expect(response.body.options).toEqual(['Baixo', 'Médio', 'Alto']);
  });

  it('GET /organizations/:orgId/custom-fields → deve listar campos customizados', async () => {
    const organizationId = await createOrganization();

    await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/custom-fields`)
      .send({
        targetCollection: 'operators',
        fieldKey: 'bloodType',
        label: 'Tipo Sanguíneo',
        dataType: 'string',
        required: false,
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/custom-fields`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('GET /organizations/:orgId/custom-fields/:id → deve retornar campo por ID', async () => {
    const organizationId = await createOrganization();

    const createResponse = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/custom-fields`)
      .send({
        targetCollection: 'clients',
        fieldKey: 'segment',
        label: 'Segmento',
        dataType: 'string',
        required: false,
      })
      .expect(201);

    const fieldId = createResponse.body.id as string;

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/custom-fields/${fieldId}`)
      .expect(200);

    expect(response.body.id).toBe(fieldId);
    expect(response.body.fieldKey).toBe('segment');
  });

  it('PATCH → deve atualizar um campo customizado', async () => {
    const organizationId = await createOrganization();

    const createResponse = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/custom-fields`)
      .send({
        targetCollection: 'equipments',
        fieldKey: 'warranty',
        label: 'Garantia',
        dataType: 'date',
        required: false,
      })
      .expect(201);

    const fieldId = createResponse.body.id as string;

    const response = await request(app.getHttpServer())
      .patch(`/organizations/${organizationId}/custom-fields/${fieldId}`)
      .send({
        label: 'Data de Garantia',
        required: true,
        helpText: 'Data de fim da garantia do equipamento',
      })
      .expect(200);

    expect(response.body.label).toBe('Data de Garantia');
    expect(response.body.required).toBe(true);
    expect(response.body.helpText).toBe(
      'Data de fim da garantia do equipamento',
    );
  });

  it('PATCH → deve bloquear fieldKey duplicado na mesma collection', async () => {
    const organizationId = await createOrganization();

    const first = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/custom-fields`)
      .send({
        targetCollection: 'equipments',
        fieldKey: 'serialExtra',
        label: 'Serial Extra',
        dataType: 'string',
        required: false,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/custom-fields`)
      .send({
        targetCollection: 'equipments',
        fieldKey: 'duplicateKey',
        label: 'Duplicado',
        dataType: 'string',
        required: false,
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .patch(`/organizations/${organizationId}/custom-fields/${first.body.id}`)
      .send({
        targetCollection: 'equipments',
        fieldKey: 'duplicateKey',
      })
      .expect(409);

    expect(response.body.message).toContain('already exists');
  });

  it('DELETE → deve realizar soft delete no campo customizado', async () => {
    const organizationId = await createOrganization();

    const createResponse = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/custom-fields`)
      .send({
        targetCollection: 'operators',
        fieldKey: 'trainingLevel',
        label: 'Nível de Treinamento',
        dataType: 'select',
        required: false,
        options: ['Básico', 'Intermediário', 'Avançado'],
      })
      .expect(201);

    const fieldId = createResponse.body.id as string;

    await request(app.getHttpServer())
      .delete(`/organizations/${organizationId}/custom-fields/${fieldId}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/custom-fields/${fieldId}`)
      .expect(404);
  });

  it('GET → deve retornar 400 para customFieldId inválido', async () => {
    const organizationId = await createOrganization();

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/custom-fields/invalid-id`)
      .expect(400);

    expect(response.body.message).toContain('Invalid custom field id');
  });
});
