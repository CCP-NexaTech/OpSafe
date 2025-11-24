import { INestApplication, ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';

import { AppModule } from '../../src/app.module';
import { DATABASE_CONNECTION } from '../../src/database/database.module';
import { JwtAuthGuard } from '../../src/auth/jwt-auth.guard';

describe('EquipmentTypes (e2e)', () => {
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
      .overrideProvider(DATABASE_CONNECTION)
      .useValue(db)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    if (mongod) {
      await mongod.stop();
    }
  });

  const createOrganization = async () => {
    const response = await request(app.getHttpServer())
      .post('/organizations')
      .send({
        name: 'Org Equipment Types',
        status: 'active',
      })
      .expect(201);

    return response.body.id as string;
  };

  const createEquipmentType = async (organizationId: string) => {
    const response = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/equipment-types`)
      .send({
        name: 'Colete Balístico',
        category: 'Proteção Individual',
        description: 'Colete nível IIIA',
        status: 'active',
      })
      .expect(201);

    return response.body;
  };

  it('POST /organizations/:orgId/equipment-types → deve criar um tipo de equipamento', async () => {
    const organizationId = await createOrganization();

    const response = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/equipment-types`)
      .send({
        name: 'Rádio Comunicador',
        category: 'Comunicação',
        description: 'Rádio VHF portátil',
        status: 'active',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Rádio Comunicador');
    expect(response.body.category).toBe('Comunicação');
  });

  it('GET /organizations/:orgId/equipment-types → deve listar tipos de equipamento', async () => {
    const organizationId = await createOrganization();
    await createEquipmentType(organizationId);

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/equipment-types`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('GET /organizations/:orgId/equipment-types/:id → deve retornar tipo por ID', async () => {
    const organizationId = await createOrganization();
    const equipmentType = await createEquipmentType(organizationId);

    const response = await request(app.getHttpServer())
      .get(
        `/organizations/${organizationId}/equipment-types/${equipmentType.id}`,
      )
      .expect(200);

    expect(response.body.id).toBe(equipmentType.id);
    expect(response.body.name).toBe('Colete Balístico');
  });

  it('PATCH → deve atualizar um tipo de equipamento', async () => {
    const organizationId = await createOrganization();
    const equipmentType = await createEquipmentType(organizationId);

    const response = await request(app.getHttpServer())
      .patch(
        `/organizations/${organizationId}/equipment-types/${equipmentType.id}`,
      )
      .send({
        name: 'Colete Balístico Atualizado',
        description: 'Colete nível IIIA reforçado',
        status: 'inactive',
      })
      .expect(200);

    expect(response.body.name).toBe('Colete Balístico Atualizado');
    expect(response.body.status).toBe('inactive');
  });

  it('PATCH → deve bloquear nome/categoria duplicados', async () => {
    const organizationId = await createOrganization();

    const first = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/equipment-types`)
      .send({
        name: 'Tonfa',
        category: 'Defesa Pessoal',
        status: 'active',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/equipment-types`)
      .send({
        name: 'Spray de Pimenta',
        category: 'Defesa Pessoal',
        status: 'active',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .patch(
        `/organizations/${organizationId}/equipment-types/${first.body.id}`,
      )
      .send({
        name: 'Spray de Pimenta',
        category: 'Defesa Pessoal',
      })
      .expect(409);

    expect(response.body.message).toContain('already exists');
  });

  it('DELETE → deve realizar soft delete no tipo de equipamento', async () => {
    const organizationId = await createOrganization();
    const equipmentType = await createEquipmentType(organizationId);

    await request(app.getHttpServer())
      .delete(
        `/organizations/${organizationId}/equipment-types/${equipmentType.id}`,
      )
      .expect(200);

    await request(app.getHttpServer())
      .get(
        `/organizations/${organizationId}/equipment-types/${equipmentType.id}`,
      )
      .expect(404);
  });

  it('GET LIST → não deve listar tipo deletado', async () => {
    const organizationId = await createOrganization();
    const equipmentType = await createEquipmentType(organizationId);

    await request(app.getHttpServer())
      .delete(
        `/organizations/${organizationId}/equipment-types/${equipmentType.id}`,
      )
      .expect(200);

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/equipment-types`)
      .expect(200);

    const ids = response.body.map((item: any) => item.id);
    expect(ids).not.toContain(equipmentType.id);
  });

  it('GET → deve retornar 400 para equipmentTypeId inválido', async () => {
    const organizationId = await createOrganization();

    const response = await request(app.getHttpServer())
      .get(
        `/organizations/${organizationId}/equipment-types/invalid-id`,
      )
      .expect(400);

    expect(response.body.message).toContain('Invalid equipment type id');
  });
});
