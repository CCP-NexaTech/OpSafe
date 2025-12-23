import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db, ObjectId } from 'mongodb';

import { AppModule } from '../../src/app.module';
import { DATABASE_CONNECTION } from '../../src/database/database.module';
import type { User } from '../../src/types/database/users';
import { JwtAuthGuard } from '../../src/auth/jwt-auth.guard';

describe('Auth + Invite flow (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let db: Db;

  const mockUserId = new ObjectId();
  const mockOrganizationId = new ObjectId();

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
          const req = context.switchToHttp().getRequest();

          req.user = {
            userId: mockUserId.toHexString(),
            organizationId: mockOrganizationId.toHexString(),
            role: 'admin',
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

  beforeEach(async () => {
    const collections = await db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  });

  it('should complete full flow: invite → accept invite → login', async () => {
    const httpServer = app.getHttpServer();

    const orgResponse = await request(httpServer)
      .post('/organizations')
      .send({ name: 'Org Auth Flow', status: 'active' })
      .expect(201);

    const organizationId = orgResponse.body.id as string;

    const inviteResponse = await request(httpServer)
      .post(`/organizations/${organizationId}/users`)
      .send({
        email: 'user.authflow@test.com',
        name: 'User Auth Flow',
        role: 'admin',
      })
      .expect(201);

    const acceptInviteUrl = inviteResponse.body.acceptInviteUrl as string;

    const url = new URL(acceptInviteUrl);
    const invitationToken = url.searchParams.get('token');
    expect(invitationToken).toBeTruthy();

    await request(httpServer)
      .post(`/organizations/${organizationId}/users/accept-invite`)
      .send({
        token: invitationToken,
        name: 'User Auth Flow',
        password: 'SenhaForte123!',
      })
      .expect(200);

    const loginResponse = await request(httpServer)
      .post('/auth/login')
      .send({ email: 'user.authflow@test.com', password: 'SenhaForte123!' })
      .expect(201);

    const accessToken = loginResponse.body.accessToken as string;
    expect(accessToken).toBeTruthy();
  });

  it('should reject accept-invite when invitation is expired', async () => {
    const httpServer = app.getHttpServer();

    // 1) Cria organização direto pela API
    const orgResponse = await request(httpServer)
      .post('/organizations')
      .send({
        name: 'Org Expired Invite',
        status: 'active',
      })
      .expect(201);

    const organizationId = orgResponse.body.id as string;

    // 2) Insere usuário com convite expirado direto no banco
    const now = new Date();
    const expiredDate = new Date(now.getTime() - 60 * 60 * 1000);

    const expiredToken = 'expired-token-123';

    const usersCollection = db.collection<User>('users');

    await usersCollection.insertOne({
      _id: new ObjectId(),
      organizationId: new ObjectId(organizationId),
      email: 'expired.invite@test.com',
      name: 'Expired User',
      role: 'admin',
      status: 'pending',
      passwordHash: null as any,
      invitationToken: expiredToken,
      invitationExpiresAt: expiredDate,
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
      deletedAt: null as any,
    });

    // 3) Tentar aceitar convite expirado
    const acceptResponse = await request(httpServer)
      .post(`/organizations/${organizationId}/users/accept-invite`)
      .send({
        token: expiredToken,
        name: 'Expired User',
        password: 'SenhaQualquer123!',
      })
      .expect(400);

    expect(acceptResponse.body.message).toContain('Invitation expired');
  });

  it('GET /auth/me → should return current user profile from database', async () => {
    const httpServer = app.getHttpServer();
    const usersCollection = db.collection<User>('users');

    const now = new Date();

    await usersCollection.insertOne({
      _id: mockUserId,
      organizationId: mockOrganizationId,
      email: 'me.user@test.com',
      name: 'Me User',
      role: 'admin',
      status: 'active',
      passwordHash: null as any,
      invitationToken: null as any,
      invitationExpiresAt: null as any,
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
      deletedAt: null as any,
    });

    const response = await request(httpServer).get('/auth/me').expect(200);

    expect(response.body).toEqual({
      id: mockUserId.toHexString(),
      organizationId: mockOrganizationId.toHexString(),
      email: 'me.user@test.com',
      name: 'Me User',
      role: 'admin',
      status: 'active',
    });
  });

  it('GET /auth/me → should reject when user isDeleted=true', async () => {
    const httpServer = app.getHttpServer();
    const usersCollection = db.collection<User>('users');

    const now = new Date();

    await usersCollection.insertOne({
      _id: mockUserId,
      organizationId: mockOrganizationId,
      email: 'deleted.user@test.com',
      name: 'Deleted User',
      role: 'admin',
      status: 'active',
      passwordHash: null as any,
      invitationToken: null as any,
      invitationExpiresAt: null as any,
      createdAt: now,
      updatedAt: now,
      isDeleted: true,
      deletedAt: now as any,
    });

    await request(httpServer).get('/auth/me').expect(401);
  });
});
