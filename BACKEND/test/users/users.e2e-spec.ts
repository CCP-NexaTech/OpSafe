import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Db, MongoClient } from 'mongodb';

import { AppModule } from '../../src/app.module';
import { DATABASE_CONNECTION } from '../../src/database/database.module';

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
      .overrideProvider(DATABASE_CONNECTION)
      .useValue(db)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await db.dropDatabase();
  });

  afterAll(async () => {
    await app.close();
    if (mongod) {
      await mongod.stop();
    }
  });

  async function createOrganization(): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/organizations')
      .send({
        name: 'Org Teste Users',
        document: '00.000.000/0001-00',
        status: 'active',
      })
      .expect(201);

    return response.body.id as string;
  }

  it('POST /organizations/:orgId/users/invite → cria usuário pendente com convite', async () => {
    const organizationId = await createOrganization();

    const response = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/users/invite`)
      .send({
        email: 'user.invite@example.com',
        name: 'User Invite',
        role: 'admin',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('invitationToken');
    expect(response.body.email).toBe('user.invite@example.com');
    expect(response.body.status).toBe('pending');
  });

  it('POST /users/accept-invite → aceita convite e ativa o usuário', async () => {
    const organizationId = await createOrganization();

    const inviteResponse = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/users/invite`)
      .send({
        email: 'user.accept@example.com',
        name: 'User Accept',
        role: 'viewer',
      })
      .expect(201);

    const invitationToken = inviteResponse.body.invitationToken as string;

    const acceptResponse = await request(app.getHttpServer())
      .post('/users/accept-invite')
      .send({
        token: invitationToken,
        password: 'senhaSegura123',
        name: 'User Accept Final',
      })
      .expect(201);

    expect(acceptResponse.body.email).toBe('user.accept@example.com');
    expect(acceptResponse.body.name).toBe('User Accept Final');
    expect(acceptResponse.body.status).toBe('active');
  });

  it('GET /organizations/:orgId/users → lista usuários da organização', async () => {
    const organizationId = await createOrganization();

    const inviteResponse = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/users/invite`)
      .send({
        email: 'user.list@example.com',
        name: 'User List',
        role: 'manager',
      })
      .expect(201);

    const invitationToken = inviteResponse.body.invitationToken as string;

    await request(app.getHttpServer())
      .post('/users/accept-invite')
      .send({
        token: invitationToken,
        password: 'senhaSegura123',
        name: 'User List Final',
      })
      .expect(201);

    const listResponse = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/users`)
      .expect(200);

    expect(Array.isArray(listResponse.body)).toBe(true);
    expect(listResponse.body.length).toBe(1);

    const user = listResponse.body[0];
    expect(user.email).toBe('user.list@example.com');
    expect(user.status).toBe('active');
  });

  it('deve impedir convite duplicado para o mesmo e-mail na mesma organização', async () => {
    const organizationId = await createOrganization();

    const payload = {
      email: 'user.dup@example.com',
      name: 'User Dup',
      role: 'viewer',
    };

    await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/users/invite`)
      .send(payload)
      .expect(201);

    const second = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/users/invite`)
      .send(payload)
      .expect(409);

    expect(second.body.message).toBe(
      'User with this email already exists in this organization',
    );
  });
});
