import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';

import { AppModule } from '../../src/app.module';
import { DATABASE_CONNECTION } from '../../src/database/database.module';
import { JwtAuthGuard } from '../../src/auth/jwt-auth.guard';
import { RoleGuard } from '../../src/auth/role.guard';

describe('Terms (e2e)', () => {
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
        name: 'Org Terms',
        status: 'active',
      })
      .expect(201);

    return response.body.id as string;
  };

  const createTerm = async (organizationId: string) => {
    const response = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/terms`)
      .send({
        code: 'EQUIP_RESP',
        title: 'Termo de Responsabilidade de Equipamentos',
        description: 'Responsabilidade sobre uso e guarda de equipamentos',
        content: 'Texto completo do termo...',
        version: '1.0',
        status: 'active',
      })
      .expect(201);

    return response.body;
  };

  it('POST /organizations/:orgId/terms → deve criar um termo', async () => {
    const organizationId = await createOrganization();

    const response = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/terms`)
      .send({
        code: 'CONFID',
        title: 'Termo de Confidencialidade',
        description: 'Confidencialidade de informações operacionais',
        content: 'Texto do termo de confidencialidade...',
        version: '1.0',
        status: 'active',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.code).toBe('CONFID');
    expect(response.body.title).toBe('Termo de Confidencialidade');
  });

  it('GET /organizations/:orgId/terms → deve listar termos', async () => {
    const organizationId = await createOrganization();
    await createTerm(organizationId);

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/terms`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('GET /organizations/:orgId/terms/:id → deve retornar termo por ID', async () => {
    const organizationId = await createOrganization();
    const term = await createTerm(organizationId);

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/terms/${term.id}`)
      .expect(200);

    expect(response.body.id).toBe(term.id);
    expect(response.body.code).toBe('EQUIP_RESP');
  });

  it('PATCH → deve atualizar um termo', async () => {
    const organizationId = await createOrganization();
    const term = await createTerm(organizationId);

    const response = await request(app.getHttpServer())
      .patch(`/organizations/${organizationId}/terms/${term.id}`)
      .send({
        title: 'Termo de Responsabilidade Atualizado',
        status: 'inactive',
      })
      .expect(200);

    expect(response.body.title).toBe('Termo de Responsabilidade Atualizado');
    expect(response.body.status).toBe('inactive');
  });

  it('PATCH → deve bloquear code + version duplicados', async () => {
    const organizationId = await createOrganization();

    await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/terms`)
      .send({
        code: 'EQUIP_RESP',
        title: 'Termo v1',
        content: 'Texto v1',
        version: '1.0',
      })
      .expect(201);

    const term2 = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/terms`)
      .send({
        code: 'EQUIP_RESP',
        title: 'Termo v2',
        content: 'Texto v2',
        version: '2.0',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .patch(`/organizations/${organizationId}/terms/${term2.body.id}`)
      .send({
        version: '1.0',
      })
      .expect(409);

    expect(response.body.message).toContain('already exists');
  });

  it('DELETE → deve realizar soft delete no termo', async () => {
    const organizationId = await createOrganization();
    const term = await createTerm(organizationId);

    await request(app.getHttpServer())
      .delete(`/organizations/${organizationId}/terms/${term.id}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/terms/${term.id}`)
      .expect(404);
  });

  it('GET LIST → não deve listar termo deletado', async () => {
    const organizationId = await createOrganization();
    const term = await createTerm(organizationId);

    await request(app.getHttpServer())
      .delete(`/organizations/${organizationId}/terms/${term.id}`)
      .expect(200);

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/terms`)
      .expect(200);

    const ids = response.body.map((t: any) => t.id);
    expect(ids).not.toContain(term.id);
  });

  it('GET → deve retornar 400 para termId inválido', async () => {
    const organizationId = await createOrganization();

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/terms/invalid-id`)
      .expect(400);

    expect(response.body.message).toContain('Invalid term id');
  });
});
