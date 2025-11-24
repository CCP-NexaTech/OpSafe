import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';
import { URL } from 'url';

import { AppModule } from '../../src/app.module';
import { DATABASE_CONNECTION } from '../../src/database/database.module';
import { JwtAuthGuard } from '../../src/auth/jwt-auth.guard';

describe('Users (e2e)', () => {
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

  it('GET /organizations/:id/users → should list users of organization', async () => {
    const orgResponse = await request(app.getHttpServer())
      .post('/organizations')
      .send({
        name: 'Org List Users',
        status: 'active',
      })
      .expect(201);

    const organizationId = orgResponse.body.id as string;

    await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/users/invite`)
      .send({
        email: 'list.user@example.com',
        name: 'User List',
        role: 'viewer',
      })
      .expect(201);

    const listResponse = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/users`)
      .expect(200);

    expect(Array.isArray(listResponse.body)).toBe(true);
    expect(listResponse.body.length).toBe(1);
    expect(listResponse.body[0].email).toBe('list.user@example.com');
    expect(listResponse.body[0].isDeleted).toBe(false);
  });

  it('GET /organizations/:orgId/users/:userId → should return a specific user', async () => {
    const orgResponse = await request(app.getHttpServer())
      .post('/organizations')
      .send({
        name: 'Org Get User',
        status: 'active',
      })
      .expect(201);

    const organizationId = orgResponse.body.id as string;

    const inviteResponse = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/users/invite`)
      .send({
        email: 'get.user@example.com',
        name: 'User Get',
        role: 'admin',
      })
      .expect(201);

    const userId = inviteResponse.body.id as string;

    const getResponse = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/users/${userId}`)
      .expect(200);

    expect(getResponse.body.id).toBe(userId);
    expect(getResponse.body.organizationId).toBe(organizationId);
    expect(getResponse.body.email).toBe('get.user@example.com');
    expect(getResponse.body.name).toBe('User Get');
    expect(getResponse.body.isDeleted).toBe(false);
  });

  it('PATCH /organizations/:orgId/users/:userId → should update user data', async () => {
    const orgResponse = await request(app.getHttpServer())
      .post('/organizations')
      .send({
        name: 'Org Patch User',
        status: 'active',
      })
      .expect(201);

    const organizationId = orgResponse.body.id as string;

    const inviteResponse = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/users/invite`)
      .send({
        email: 'patch.user@example.com',
        name: 'User Patch',
        role: 'viewer',
      })
      .expect(201);

    const userId = inviteResponse.body.id as string;

    const patchResponse = await request(app.getHttpServer())
      .patch(`/organizations/${organizationId}/users/${userId}`)
      .send({
        name: 'User Patch Updated',
        role: 'admin',
      })
      .expect(200);

    expect(patchResponse.body.id).toBe(userId);
    expect(patchResponse.body.name).toBe('User Patch Updated');
    expect(patchResponse.body.role).toBe('admin');
    expect(patchResponse.body.isDeleted).toBe(false);
  });

  it('DELETE /organizations/:orgId/users/:userId → should soft delete user and remove from list', async () => {
    const orgResponse = await request(app.getHttpServer())
      .post('/organizations')
      .send({
        name: 'Org Delete User',
        status: 'active',
      })
      .expect(201);

    const organizationId = orgResponse.body.id as string;

    const inviteResponse = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/users/invite`)
      .send({
        email: 'delete.user@example.com',
        name: 'User Delete',
        role: 'viewer',
      })
      .expect(201);

    const userId = inviteResponse.body.id as string;

    const listBefore = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/users`)
      .expect(200);

    const foundBefore = listBefore.body.find(
      (user: any) => user.id === userId,
    );
    expect(foundBefore).toBeTruthy();
    expect(foundBefore.isDeleted).toBe(false);

    await request(app.getHttpServer())
      .delete(`/organizations/${organizationId}/users/${userId}`)
      .expect(200);

    const listAfter = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/users`)
      .expect(200);

    const foundAfter = listAfter.body.find((user: any) => user.id === userId);
    expect(foundAfter).toBeUndefined();

    await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/users/${userId}`)
      .expect(404);
  });
});
