import { INestApplication, ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';

import { AppModule } from '../../src/app.module';
import { DATABASE_CONNECTION } from '../../src/database/database.module';
import { JwtAuthGuard } from '../../src/auth/jwt-auth.guard';

describe('Clients (e2e)', () => {
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
        name: 'Client Org',
        status: 'active',
      })
      .expect(201);

    return response.body.id as string;
  };

  const createClient = async (organizationId: string) => {
    const response = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/clients`)
      .send({
        name: 'Cliente Teste',
        document: '00.000.000/0001-00',
        mainContactName: 'Fulano',
        mainContactPhone: '99999-9999',
        addressCity: 'Fortaleza',
        addressState: 'CE',
      })
      .expect(201);

    return response.body;
  };

  it('POST /organizations/:orgId/clients → deve criar um cliente', async () => {
    const organizationId = await createOrg();

    const response = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/clients`)
      .send({
        name: 'Cliente A',
        document: '11.111.111/0001-11',
        mainContactName: 'Contato A',
        mainContactPhone: '88888-8888',
        addressCity: 'Lages',
        addressState: 'SC',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Cliente A');
    expect(response.body.document).toBe('11.111.111/0001-11');
  });

  it('GET /organizations/:orgId/clients → deve listar clientes', async () => {
    const organizationId = await createOrg();
    await createClient(organizationId);

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/clients`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('GET /organizations/:orgId/clients/:clientId → deve retornar cliente por ID', async () => {
    const organizationId = await createOrg();
    const clientCreated = await createClient(organizationId);

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/clients/${clientCreated.id}`)
      .expect(200);

    expect(response.body.id).toBe(clientCreated.id);
    expect(response.body.name).toBe('Cliente Teste');
  });

  it('PATCH → deve atualizar um cliente', async () => {
    const organizationId = await createOrg();
    const clientCreated = await createClient(organizationId);

    const response = await request(app.getHttpServer())
      .patch(`/organizations/${organizationId}/clients/${clientCreated.id}`)
      .send({
        name: 'Cliente Atualizado',
        mainContactName: 'Contato Atualizado',
      })
      .expect(200);

    expect(response.body.name).toBe('Cliente Atualizado');
    expect(response.body.mainContactName).toBe('Contato Atualizado');
  });

  it('PATCH → deve bloquear document duplicado', async () => {
    const organizationId = await createOrg();

    const client1 = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/clients`)
      .send({
        name: 'Cliente 1',
        document: '22.222.222/0001-22',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/clients`)
      .send({
        name: 'Cliente 2',
        document: '33.333.333/0001-33',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .patch(`/organizations/${organizationId}/clients/${client1.body.id}`)
      .send({
        document: '33.333.333/0001-33',
      })
      .expect(409);

    expect(response.body.message).toContain('already exists');
  });

  it('DELETE → deve realizar soft delete no cliente', async () => {
    const organizationId = await createOrg();
    const clientCreated = await createClient(organizationId);

    await request(app.getHttpServer())
      .delete(`/organizations/${organizationId}/clients/${clientCreated.id}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/clients/${clientCreated.id}`)
      .expect(404);
  });

  it('GET LIST → não deve listar cliente deletado', async () => {
    const organizationId = await createOrg();
    const clientCreated = await createClient(organizationId);

    await request(app.getHttpServer())
      .delete(`/organizations/${organizationId}/clients/${clientCreated.id}`)
      .expect(200);

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/clients`)
      .expect(200);

    const ids = response.body.map((c: any) => c.id);
    expect(ids).not.toContain(clientCreated.id);
  });

  it('GET /clients/:id → deve retornar 400 para ID inválido', async () => {
    const organizationId = await createOrg();

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/clients/invalid-id`)
      .expect(400);

    expect(response.body.message).toContain('Invalid client id');
  });
});
