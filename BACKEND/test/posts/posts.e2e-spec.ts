import { INestApplication, ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';

import { AppModule } from '../../src/app.module';
import { DATABASE_CONNECTION } from '../../src/database/database.module';
import { JwtAuthGuard } from '../../src/auth/jwt-auth.guard';

describe('Posts (e2e)', () => {
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
        name: 'Org Posts',
        status: 'active',
      })
      .expect(201);

    return response.body.id as string;
  };

  const createClient = async (organizationId: string) => {
    const response = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/clients`)
      .send({
        name: 'Cliente Postos',
        document: '77.777.777/0001-77',
      })
      .expect(201);

    return response.body.id as string;
  };

  const createPost = async (organizationId: string, clientId: string) => {
    const response = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/posts`)
      .send({
        clientId,
        name: 'Portaria Principal',
        location: 'Bloco A - Entrada 1',
        status: 'active',
      })
      .expect(201);

    return response.body;
  };

  it('POST /organizations/:orgId/posts → deve criar um posto de serviço', async () => {
    const organizationId = await createOrganization();
    const clientId = await createClient(organizationId);

    const response = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/posts`)
      .send({
        clientId,
        name: 'Guarita Norte',
        location: 'Acesso Norte',
        status: 'active',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Guarita Norte');
    expect(response.body.clientId).toBe(clientId);
  });

  it('GET /organizations/:orgId/posts → deve listar postos', async () => {
    const organizationId = await createOrganization();
    const clientId = await createClient(organizationId);
    await createPost(organizationId, clientId);

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/posts`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('GET /organizations/:orgId/posts/:postId → deve retornar posto por ID', async () => {
    const organizationId = await createOrganization();
    const clientId = await createClient(organizationId);
    const post = await createPost(organizationId, clientId);

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/posts/${post.id}`)
      .expect(200);

    expect(response.body.id).toBe(post.id);
    expect(response.body.name).toBe('Portaria Principal');
  });

  it('PATCH → deve atualizar um posto', async () => {
    const organizationId = await createOrganization();
    const clientId = await createClient(organizationId);
    const post = await createPost(organizationId, clientId);

    const response = await request(app.getHttpServer())
      .patch(`/organizations/${organizationId}/posts/${post.id}`)
      .send({
        name: 'Portaria Leste',
        location: 'Acesso Leste - Bloco B',
        status: 'inactive',
      })
      .expect(200);

    expect(response.body.name).toBe('Portaria Leste');
    expect(response.body.status).toBe('inactive');
  });

  it('PATCH → deve bloquear nome duplicado para mesmo cliente', async () => {
    const organizationId = await createOrganization();
    const clientId = await createClient(organizationId);

    const first = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/posts`)
      .send({
        clientId,
        name: 'Entrada Principal',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/posts`)
      .send({
        clientId,
        name: 'Entrada Secundária',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .patch(`/organizations/${organizationId}/posts/${first.body.id}`)
      .send({
        name: 'Entrada Secundária',
      })
      .expect(409);

    expect(response.body.message).toContain('already exists');
  });

  it('DELETE → deve realizar soft delete no posto', async () => {
    const organizationId = await createOrganization();
    const clientId = await createClient(organizationId);
    const post = await createPost(organizationId, clientId);

    await request(app.getHttpServer())
      .delete(`/organizations/${organizationId}/posts/${post.id}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/posts/${post.id}`)
      .expect(404);
  });

  it('GET LIST → não deve listar posto deletado', async () => {
    const organizationId = await createOrganization();
    const clientId = await createClient(organizationId);
    const post = await createPost(organizationId, clientId);

    await request(app.getHttpServer())
      .delete(`/organizations/${organizationId}/posts/${post.id}`)
      .expect(200);

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/posts`)
      .expect(200);

    const ids = response.body.map((p: any) => p.id);
    expect(ids).not.toContain(post.id);
  });

  it('GET → deve retornar 400 para postId inválido', async () => {
    const organizationId = await createOrganization();

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/posts/invalid-id`)
      .expect(400);

    expect(response.body.message).toContain('Invalid post id');
  });
});
