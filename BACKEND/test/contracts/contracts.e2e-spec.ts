import { INestApplication, ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';

import { AppModule } from '../../src/app.module';
import { DATABASE_CONNECTION } from '../../src/database/database.module';
import { JwtAuthGuard } from '../../src/auth/jwt-auth.guard';

describe('Contracts (e2e)', () => {
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

  const createOrg = async () => {
    const response = await request(app.getHttpServer())
      .post('/organizations')
      .send({
        name: 'Org Contracts',
        status: 'active',
      })
      .expect(201);

    return response.body.id as string;
  };

  const createClient = async (organizationId: string) => {
    const response = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/clients`)
      .send({
        name: 'Cliente Contratos',
        document: '55.555.555/0001-55',
      })
      .expect(201);

    return response.body.id as string;
  };

  const createContract = async (organizationId: string, clientId: string) => {
    const response = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/contracts`)
      .send({
        clientId,
        code: 'CT-001',
        description: 'Contrato de vigilância padrão',
        startDate: '2025-01-01T00:00:00.000Z',
        status: 'draft',
      })
      .expect(201);

    return response.body;
  };

  it('POST /organizations/:orgId/contracts → deve criar um contrato', async () => {
    const organizationId = await createOrg();
    const clientId = await createClient(organizationId);

    const response = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/contracts`)
      .send({
        clientId,
        code: 'CT-100',
        description: 'Contrato teste 100',
        startDate: '2025-01-10T00:00:00.000Z',
        endDate: '2025-12-31T23:59:59.000Z',
        status: 'active',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.code).toBe('CT-100');
    expect(response.body.status).toBe('active');
  });

  it('GET /organizations/:orgId/contracts → deve listar contratos', async () => {
    const organizationId = await createOrg();
    const clientId = await createClient(organizationId);
    await createContract(organizationId, clientId);

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/contracts`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('GET /organizations/:orgId/contracts/:contractId → deve retornar contrato por ID', async () => {
    const organizationId = await createOrg();
    const clientId = await createClient(organizationId);
    const contract = await createContract(organizationId, clientId);

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/contracts/${contract.id}`)
      .expect(200);

    expect(response.body.id).toBe(contract.id);
    expect(response.body.code).toBe('CT-001');
  });

  it('PATCH → deve atualizar um contrato', async () => {
    const organizationId = await createOrg();
    const clientId = await createClient(organizationId);
    const contract = await createContract(organizationId, clientId);

    const response = await request(app.getHttpServer())
      .patch(`/organizations/${organizationId}/contracts/${contract.id}`)
      .send({
        description: 'Contrato atualizado',
        status: 'active',
      })
      .expect(200);

    expect(response.body.description).toBe('Contrato atualizado');
    expect(response.body.status).toBe('active');
  });

  it('PATCH → deve bloquear code duplicado', async () => {
    const organizationId = await createOrg();
    const clientId = await createClient(organizationId);

    const contract1 = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/contracts`)
      .send({
        clientId,
        code: 'CT-DUP-1',
        description: 'Primeiro contrato',
        startDate: '2025-01-01T00:00:00.000Z',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/contracts`)
      .send({
        clientId,
        code: 'CT-DUP-2',
        description: 'Segundo contrato',
        startDate: '2025-02-01T00:00:00.000Z',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .patch(`/organizations/${organizationId}/contracts/${contract1.body.id}`)
      .send({
        code: 'CT-DUP-2',
      })
      .expect(409);

    expect(response.body.message).toContain('already exists');
  });

  it('DELETE → deve realizar soft delete no contrato', async () => {
    const organizationId = await createOrg();
    const clientId = await createClient(organizationId);
    const contract = await createContract(organizationId, clientId);

    await request(app.getHttpServer())
      .delete(`/organizations/${organizationId}/contracts/${contract.id}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/contracts/${contract.id}`)
      .expect(404);
  });

  it('GET LIST → não deve listar contrato deletado', async () => {
    const organizationId = await createOrg();
    const clientId = await createClient(organizationId);
    const contract = await createContract(organizationId, clientId);

    await request(app.getHttpServer())
      .delete(`/organizations/${organizationId}/contracts/${contract.id}`)
      .expect(200);

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/contracts`)
      .expect(200);

    const ids = response.body.map((c: any) => c.id);
    expect(ids).not.toContain(contract.id);
  });

  it('GET /contracts/:id → deve retornar 400 para ID inválido', async () => {
    const organizationId = await createOrg();

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/contracts/invalid-id`)
      .expect(400);

    expect(response.body.message).toContain('Invalid contract id');
  });
});
