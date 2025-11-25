// BACKEND/test/alerts/alerts.e2e-spec.ts
import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';

import { AppModule } from '../../src/app.module';
import { DATABASE_CONNECTION } from '../../src/database/database.module';
import { JwtAuthGuard } from '../../src/auth/jwt-auth.guard';
import { RoleGuard } from '../../src/auth/role.guard';

describe('Alerts (e2e)', () => {
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
    if (mongod) {
      await mongod.stop();
    }
  });

  const createOrganization = async () => {
    const response = await request(app.getHttpServer())
      .post('/organizations')
      .send({
        name: 'Org Alerts',
        status: 'active',
      })
      .expect(201);

    return response.body.id as string;
  };

  it('POST /organizations/:orgId/alerts → deve criar um alerta', async () => {
    const organizationId = await createOrganization();

    const response = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/alerts`)
      .send({
        type: 'maintenanceDue',
        severity: 'warning',
        message: 'Manutenção preventiva vence em 7 dias',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.type).toBe('maintenanceDue');
    expect(response.body.severity).toBe('warning');
    expect(response.body.message).toBe('Manutenção preventiva vence em 7 dias');
  });

  it('GET /organizations/:orgId/alerts → deve listar alertas', async () => {
    const organizationId = await createOrganization();

    await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/alerts`)
      .send({
        type: 'epiExpiry',
        severity: 'info',
        message: 'EPI prestes a vencer',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/alerts`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('GET /organizations/:orgId/alerts/:id → deve retornar alerta por ID', async () => {
    const organizationId = await createOrganization();

    const createResponse = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/alerts`)
      .send({
        type: 'stockLow',
        severity: 'critical',
        message: 'Estoque de coletes abaixo do mínimo',
      })
      .expect(201);

    const alertId = createResponse.body.id as string;

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/alerts/${alertId}`)
      .expect(200);

    expect(response.body.id).toBe(alertId);
    expect(response.body.type).toBe('stockLow');
    expect(response.body.severity).toBe('critical');
  });

  it('PATCH → deve atualizar severidade e resolver alerta', async () => {
    const organizationId = await createOrganization();

    const createResponse = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/alerts`)
      .send({
        type: 'lateReturn',
        severity: 'warning',
        message: 'Devolução atrasada em 1 dia',
      })
      .expect(201);

    const alertId = createResponse.body.id as string;

    const nowIso = new Date().toISOString();

    const response = await request(app.getHttpServer())
      .patch(`/organizations/${organizationId}/alerts/${alertId}`)
      .send({
        severity: 'info',
        message: 'Devolução regularizada',
        resolvedAt: nowIso,
      })
      .expect(200);

    expect(response.body.severity).toBe('info');
    expect(response.body.message).toBe('Devolução regularizada');
    expect(response.body.resolvedAt).toBeTruthy();
  });

  it('DELETE → deve realizar soft delete no alerta', async () => {
    const organizationId = await createOrganization();

    const createResponse = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/alerts`)
      .send({
        type: 'epiExpiry',
        severity: 'info',
        message: 'EPI vencido',
      })
      .expect(201);

    const alertId = createResponse.body.id as string;

    await request(app.getHttpServer())
      .delete(`/organizations/${organizationId}/alerts/${alertId}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/alerts/${alertId}`)
      .expect(404);
  });

  it('GET → deve retornar 400 para alertId inválido', async () => {
    const organizationId = await createOrganization();

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/alerts/invalid-id`)
      .expect(400);

    expect(response.body.message).toContain('Invalid alert id');
  });
});
