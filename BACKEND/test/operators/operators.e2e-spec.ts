import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';

import { AppModule } from '../../src/app.module';
import { DATABASE_CONNECTION } from '../../src/database/database.module';
import { JwtAuthGuard } from '../../src/auth/jwt-auth.guard';
import { RoleGuard } from '../../src/auth/role.guard';

describe('Operators (e2e)', () => {
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
      .useValue({
        canActivate: () => true,
      })
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

  const createOrg = async () => {
    const response = await request(app.getHttpServer())
      .post('/organizations')
      .send({
        name: 'OpSafe Org',
        status: 'active',
      })
      .expect(201);

    return response.body.id as string;
  };

  const createOperator = async (organizationId: string) => {
    const response = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/operators`)
      .send({
        name: 'João Segurança',
        identifierCode: 'OP-001',
      })
      .expect(201);

    return response.body;
  };

  it('POST /organizations/:orgId/operators → deve criar um operador', async () => {
    const organizationId = await createOrg();

    const response = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/operators`)
      .send({
        name: 'Carlos Silva',
        identifierCode: 'OP-100',
        role: 'vigilante',
        phone: '99999-9999',
        shift: 'diurno',
        documentLastDigits: '1234',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Carlos Silva');
    expect(response.body.identifierCode).toBe('OP-100');
  });

  it('GET /organizations/:orgId/operators → deve listar operadores', async () => {
    const organizationId = await createOrg();
    await createOperator(organizationId);

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/operators`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('GET /organizations/:orgId/operators/:operatorId → deve retornar operador por ID', async () => {
    const organizationId = await createOrg();
    const operator = await createOperator(organizationId);

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/operators/${operator.id}`)
      .expect(200);

    expect(response.body.id).toBe(operator.id);
    expect(response.body.name).toBe('João Segurança');
  });

  it('PATCH → deve atualizar um operador', async () => {
    const organizationId = await createOrg();
    const operator = await createOperator(organizationId);

    const response = await request(app.getHttpServer())
      .patch(`/organizations/${organizationId}/operators/${operator.id}`)
      .send({
        name: 'João Atualizado',
        role: 'supervisor',
      })
      .expect(200);

    expect(response.body.name).toBe('João Atualizado');
    expect(response.body.role).toBe('supervisor');
  });

  it('PATCH → deve bloquear identifierCode duplicado', async () => {
    const organizationId = await createOrg();

    const op1 = await createOperator(organizationId);
    await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/operators`)
      .send({
        name: 'Maria',
        identifierCode: 'OP-DUP',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .patch(`/organizations/${organizationId}/operators/${op1.id}`)
      .send({
        identifierCode: 'OP-DUP',
      })
      .expect(409);

    expect(response.body.message).toContain('already exists');
  });

  it('DELETE → deve realizar soft delete no operador', async () => {
    const organizationId = await createOrg();
    const operator = await createOperator(organizationId);

    await request(app.getHttpServer())
      .delete(`/organizations/${organizationId}/operators/${operator.id}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/operators/${operator.id}`)
      .expect(404);
  });

  it('GET LIST → não deve listar operador deletado', async () => {
    const organizationId = await createOrg();
    const operator = await createOperator(organizationId);

    await request(app.getHttpServer())
      .delete(`/organizations/${organizationId}/operators/${operator.id}`)
      .expect(200);

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/operators`)
      .expect(200);

    const ids = response.body.map((op: any) => op.id);

    expect(ids).not.toContain(operator.id);
  });

  it('GET /operators/:id → deve retornar 400 para ID inválido', async () => {
    const organizationId = await createOrg();

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/operators/invalid-id`)
      .expect(400);

    expect(response.body.message).toContain('Invalid id');
  });
});
