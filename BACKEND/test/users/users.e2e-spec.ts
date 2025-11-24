import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';
import { URL } from 'url';

import { AppModule } from '../../src/app.module';
import { DATABASE_CONNECTION } from '../../src/database/database.module';
import { JwtAuthGuard } from '../../src/auth/jwt-auth.guard'

describe('Organizations (e2e)', () => {
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
    if (mongod) {
      await mongod.stop();
    }
  });

  it('POST /organizations → should create an organization', async () => {
    const response = await request(app.getHttpServer())
      .post('/organizations')
      .send({
        name: 'Empresa Teste',
        document: '00.000.000/0001-00',
        status: 'active',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Empresa Teste');
  });

  it('GET /organizations → should list organizations', async () => {
    const response = await request(app.getHttpServer())
      .get('/organizations')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('PATCH /organizations/:id → should update an organization', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/organizations')
      .send({
        name: 'Org Update',
        status: 'active',
      })
      .expect(201);

    const id = createResponse.body.id as string;

    const updateResponse = await request(app.getHttpServer())
      .patch(`/organizations/${id}`)
      .send({
        name: 'Org Atualizada',
      })
      .expect(200);

    expect(updateResponse.body.name).toBe('Org Atualizada');
  });

  it('DELETE /organizations/:id → should soft delete organization', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/organizations')
      .send({
        name: 'Org Delete',
        status: 'active',
      })
      .expect(201);

    const id = createResponse.body.id as string;

    await request(app.getHttpServer())
      .delete(`/organizations/${id}`)
      .expect(200);

    await request(app.getHttpServer()).get(`/organizations/${id}`).expect(404);
  });

  it('POST /organizations/:id/users/invite → should invite a user and return acceptInviteUrl', async () => {
    const orgResponse = await request(app.getHttpServer())
      .post('/organizations')
      .send({
        name: 'Org Invite',
        status: 'active',
      })
      .expect(201);

    const organizationId = orgResponse.body.id as string;

    const inviteResponse = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/users/invite`)
      .send({
        email: 'invite@example.com',
        name: 'Convite Teste',
        role: 'admin',
      })
      .expect(201);

    expect(inviteResponse.body).toHaveProperty('id');
    expect(inviteResponse.body).toHaveProperty('acceptInviteUrl');
    expect(inviteResponse.body.email).toBe('invite@example.com');
    expect(inviteResponse.body.status).toBe('pending');

    const acceptInviteUrl: string = inviteResponse.body.acceptInviteUrl;
    expect(typeof acceptInviteUrl).toBe('string');
    expect(acceptInviteUrl).toContain('/accept-invite?token=');
  });

  it('POST /users/accept-invite → should accept a valid invitation and activate the user', async () => {
    const orgResponse = await request(app.getHttpServer())
      .post('/organizations')
      .send({
        name: 'Org Accept',
        status: 'active',
      })
      .expect(201);

    const organizationId = orgResponse.body.id as string;

    const inviteResponse = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/users/invite`)
      .send({
        email: 'user.accept@example.com',
        name: 'User Accept',
        role: 'viewer',
      })
      .expect(201);

    const acceptInviteUrl: string = inviteResponse.body.acceptInviteUrl;
    expect(acceptInviteUrl).toContain('/accept-invite?token=');

    const url = new URL(acceptInviteUrl);
    const token = url.searchParams.get('token');

    expect(token).toBeTruthy();

    const acceptResponse = await request(app.getHttpServer())
      .post('/users/accept-invite')
      .send({
        token,
        password: 'SenhaForte123!',
        name: 'User Accept Final',
      })
      .expect(201);

    expect(acceptResponse.body.email).toBe('user.accept@example.com');
    expect(acceptResponse.body.name).toBe('User Accept Final');
    expect(acceptResponse.body.status).toBe('active');
  });

  it('POST /users/accept-invite → should reject an expired invitation', async () => {
    const orgResponse = await request(app.getHttpServer())
      .post('/organizations')
      .send({
        name: 'Org Expired',
        status: 'active',
      })
      .expect(201);

    const organizationId = orgResponse.body.id as string;

    const inviteResponse = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/users/invite`)
      .send({
        email: 'user.expired@example.com',
        name: 'User Expired',
        role: 'admin',
      })
      .expect(201);

    const acceptInviteUrl: string = inviteResponse.body.acceptInviteUrl;
    const url = new URL(acceptInviteUrl);
    const token = url.searchParams.get('token');

    expect(token).toBeTruthy();

    await db.collection('users').updateOne(
      { email: 'user.expired@example.com' },
      {
        $set: {
          invitationExpiresAt: new Date(Date.now() - 60_000),
        },
      },
    );

    const response = await request(app.getHttpServer())
      .post('/users/accept-invite')
      .send({
        token,
        password: 'Senha123!',
        name: 'User Expired Try',
      })
      .expect(400);

    expect(response.body.message).toContain('expir');
  });
});
