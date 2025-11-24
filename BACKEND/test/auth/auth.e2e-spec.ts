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

  beforeEach(async () => {
    // Limpa todas as coleções entre os testes
    const collections = await db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  });

  it('should complete full flow: invite → accept invite → login', async () => {
    const httpServer = app.getHttpServer();

    // 1) Criar organização
    const orgResponse = await request(httpServer)
      .post('/organizations')
      .send({
        name: 'Org Auth Flow',
        document: '00.000.000/0001-55',
        status: 'active',
      })
      .expect(201);

    const organizationId = orgResponse.body.id as string;
    const email = 'user.authflow@test.com';

    // 2) Gerar convite
    const inviteResponse = await request(httpServer)
      .post(`/organizations/${organizationId}/users/invite`)
      .send({
        email,
        name: 'User Auth Flow',
        role: 'admin',
      })
      .expect(201);

    const acceptInviteUrl = inviteResponse.body.acceptInviteUrl;
    expect(acceptInviteUrl).toBeDefined();

    const url = new URL(acceptInviteUrl);
    const invitationToken = url.searchParams.get('token');

    expect(invitationToken).toBeTruthy();

    // 3) Aceitar convite (define senha)
    await request(httpServer)
      .post('/users/accept-invite')
      .send({
        token: invitationToken,
        name: 'User Auth Flow',
        password: 'SenhaForte123!',
      })
      .expect(201);

    // 4) Login
    const loginResponse = await request(httpServer)
      .post('/auth/login')
      .send({
        email,
        password: 'SenhaForte123!',
      })
      .expect(201);

    expect(loginResponse.body).toHaveProperty('accessToken');
    expect(loginResponse.body).toHaveProperty('user');
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
    const expiredDate = new Date(now.getTime() - 60 * 60 * 1000); // 1h atrás

    const expiredToken = 'expired-token-123';

    const usersCollection = db.collection<User>('users');

    await usersCollection.insertOne({
      _id: new ObjectId(),
      organizationId: new ObjectId(organizationId),
      email: 'expired.invite@test.com',
      name: 'Expired User',
      role: 'admin',
      status: 'pending',
      passwordHash: undefined as any,
      invitationToken: expiredToken,
      invitationExpiresAt: expiredDate,
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
    });

    // 3) Tentar aceitar convite expirado
    const acceptResponse = await request(httpServer)
      .post('/users/accept-invite')
      .send({
        token: expiredToken,
        name: 'Expired User',
        password: 'SenhaQualquer123!',
      })
      .expect(400); // assumindo BadRequestException

    expect(acceptResponse.body.message).toContain('Invitation expired');
  });
});
