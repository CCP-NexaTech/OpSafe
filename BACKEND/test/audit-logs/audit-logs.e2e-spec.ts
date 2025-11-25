import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';

import { AppModule } from '../../src/app.module';
import { DATABASE_CONNECTION } from '../../src/database/database.module';
import { JwtAuthGuard } from '../../src/auth/jwt-auth.guard';
import { RoleGuard } from '../../src/auth/role.guard';

describe('AuditLogs (e2e)', () => {
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
      .useValue({ canActivate: () => true })
      .overrideGuard(RoleGuard)
      .useValue({ canActivate: () => true })
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

  const createOrganization = async () => {
    const response = await request(app.getHttpServer())
      .post('/organizations')
      .send({
        name: 'Org Audit',
        status: 'active',
      })
      .expect(201);

    return response.body.id as string;
  };

  const validUserId = '507f1f77bcf86cd799439011';
  const validEntityId = '507f1f77bcf86cd799439012';

  it('POST /organizations/:orgId/audit-logs → deve criar um audit log', async () => {
    const organizationId = await createOrganization();

    const response = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/audit-logs`)
      .send({
        userId: validUserId,
        action: 'user.login',
        entityType: 'user',
        entityId: validEntityId,
        ip: '127.0.0.1',
        userAgent: 'jest-test-agent',
        metadata: {
          method: 'POST',
          path: '/auth/login',
          success: true,
        },
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.organizationId).toBe(organizationId);
    expect(response.body.userId).toBe(validUserId);
    expect(response.body.action).toBe('user.login');
    expect(response.body.entityType).toBe('user');
    expect(response.body.entityId).toBe(validEntityId);
    expect(response.body.ip).toBe('127.0.0.1');
    expect(response.body.userAgent).toBe('jest-test-agent');
    expect(response.body.metadata).toMatchObject({
      method: 'POST',
      path: '/auth/login',
      success: true,
    });
  });

  it('GET /organizations/:orgId/audit-logs → deve listar audit logs', async () => {
    const organizationId = await createOrganization();

    await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/audit-logs`)
      .send({
        userId: validUserId,
        action: 'operator.create',
        entityType: 'operator',
        metadata: {
          name: 'João',
        },
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/audit-logs`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('GET /organizations/:orgId/audit-logs/:id → deve retornar audit log por ID', async () => {
    const organizationId = await createOrganization();

    const createResponse = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/audit-logs`)
      .send({
        userId: validUserId,
        action: 'client.create',
        entityType: 'client',
        entityId: validEntityId,
      })
      .expect(201);

    const logId = createResponse.body.id as string;

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/audit-logs/${logId}`)
      .expect(200);

    expect(response.body.id).toBe(logId);
    expect(response.body.action).toBe('client.create');
    expect(response.body.entityType).toBe('client');
  });

  it('PATCH → deve atualizar metadata do audit log', async () => {
    const organizationId = await createOrganization();

    const createResponse = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/audit-logs`)
      .send({
        userId: validUserId,
        action: 'equipment.update',
        entityType: 'equipment',
        entityId: validEntityId,
        metadata: {
          fromStatus: 'available',
          toStatus: 'inmaintenance',
        },
      })
      .expect(201);

    const logId = createResponse.body.id as string;

    const response = await request(app.getHttpServer())
      .patch(`/organizations/${organizationId}/audit-logs/${logId}`)
      .send({
        metadata: {
          fromStatus: 'available',
          toStatus: 'assigned',
          reason: 'assigned to operator',
        },
      })
      .expect(200);

    expect(response.body.metadata).toMatchObject({
      fromStatus: 'available',
      toStatus: 'assigned',
      reason: 'assigned to operator',
    });
  });

  it('DELETE → deve realizar soft delete no audit log', async () => {
    const organizationId = await createOrganization();

    const createResponse = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/audit-logs`)
      .send({
        userId: validUserId,
        action: 'alert.create',
        entityType: 'alert',
      })
      .expect(201);

    const logId = createResponse.body.id as string;

    await request(app.getHttpServer())
      .delete(`/organizations/${organizationId}/audit-logs/${logId}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/audit-logs/${logId}`)
      .expect(404);
  });

  it('GET → deve retornar 400 para auditLogId inválido', async () => {
    const organizationId = await createOrganization();

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/audit-logs/invalid-id`)
      .expect(400);

    expect(response.body.message).toContain('Invalid audit log id');
  });
});
