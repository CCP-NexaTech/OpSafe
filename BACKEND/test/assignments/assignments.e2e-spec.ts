import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';

import { AppModule } from '../../src/app.module';
import { DATABASE_CONNECTION } from '../../src/database/database.module';
import { JwtAuthGuard } from '../../src/auth/jwt-auth.guard';
import { RoleGuard } from '../../src/auth/role.guard';

describe('Assignments (e2e)', () => {
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
        name: 'Org Assignments',
        status: 'active',
      })
      .expect(201);

    return response.body.id as string;
  };

  const createEquipmentType = async (organizationId: string) => {
    const response = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/equipment-types`)
      .send({
        name: 'Rádio Portátil',
        category: 'Comunicação',
        description: 'Rádio VHF',
        status: 'active',
      })
      .expect(201);

    return response.body.id as string;
  };

  const createEquipment = async (
    organizationId: string,
    equipmentTypeId: string,
  ) => {
    const response = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/equipments`)
      .send({
        equipmentTypeId,
        serialNumber: 'SN-ASSIGN-001',
        assetTag: 'TAG-ASSIGN-001',
        status: 'available',
        currentLocation: {
          type: 'stock',
        },
      })
      .expect(201);

    return response.body;
  };

  it('POST /organizations/:orgId/assignments → deve criar assignment e atualizar equipamento', async () => {
    const organizationId = await createOrganization();
    const equipmentTypeId = await createEquipmentType(organizationId);
    const equipment = await createEquipment(organizationId, equipmentTypeId);

    const postRefId = '656f2f8e4b8f1c2a3b4c5d6e';

    const response = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/assignments`)
      .send({
        equipmentId: equipment.id,
        action: 'checkout',
        toLocation: {
          type: 'post',
          refId: postRefId,
        },
        notes: 'Entrega para posto principal',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.equipmentId).toBe(equipment.id);
    expect(response.body.action).toBe('checkout');
    expect(response.body.fromLocation.type).toBe('stock');
    expect(response.body.toLocation.type).toBe('post');

    const equipmentResponse = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/equipments/${equipment.id}`)
      .expect(200);

    expect(equipmentResponse.body.status).toBe('inuse');
    expect(equipmentResponse.body.currentLocation.type).toBe('post');
  });

  it('GET /organizations/:orgId/assignments → deve listar assignments', async () => {
    const organizationId = await createOrganization();
    const equipmentTypeId = await createEquipmentType(organizationId);
    const equipment = await createEquipment(organizationId, equipmentTypeId);

    await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/assignments`)
      .send({
        equipmentId: equipment.id,
        action: 'checkout',
        toLocation: {
          type: 'operator',
        },
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/assignments`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('GET /organizations/:orgId/assignments/:id → deve retornar assignment por ID', async () => {
    const organizationId = await createOrganization();
    const equipmentTypeId = await createEquipmentType(organizationId);
    const equipment = await createEquipment(organizationId, equipmentTypeId);

    const createResponse = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/assignments`)
      .send({
        equipmentId: equipment.id,
        action: 'checkout',
        toLocation: {
          type: 'operator',
        },
        notes: 'Teste get by id',
      })
      .expect(201);

    const assignmentId = createResponse.body.id as string;

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/assignments/${assignmentId}`)
      .expect(200);

    expect(response.body.id).toBe(assignmentId);
    expect(response.body.equipmentId).toBe(equipment.id);
  });

  it('PATCH → deve atualizar metadata do assignment', async () => {
    const organizationId = await createOrganization();
    const equipmentTypeId = await createEquipmentType(organizationId);
    const equipment = await createEquipment(organizationId, equipmentTypeId);

    const createResponse = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/assignments`)
      .send({
        equipmentId: equipment.id,
        action: 'checkout',
        toLocation: {
          type: 'operator',
        },
      })
      .expect(201);

    const assignmentId = createResponse.body.id as string;

    const newDate = new Date().toISOString();

    const response = await request(app.getHttpServer())
      .patch(`/organizations/${organizationId}/assignments/${assignmentId}`)
      .send({
        effectiveAt: newDate,
        notes: 'Atualizado via PATCH',
      })
      .expect(200);

    expect(response.body.notes).toBe('Atualizado via PATCH');
  });

  it('DELETE → deve realizar soft delete no assignment', async () => {
    const organizationId = await createOrganization();
    const equipmentTypeId = await createEquipmentType(organizationId);
    const equipment = await createEquipment(organizationId, equipmentTypeId);

    const createResponse = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/assignments`)
      .send({
        equipmentId: equipment.id,
        action: 'checkout',
        toLocation: {
          type: 'operator',
        },
      })
      .expect(201);

    const assignmentId = createResponse.body.id as string;

    await request(app.getHttpServer())
      .delete(`/organizations/${organizationId}/assignments/${assignmentId}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/assignments/${assignmentId}`)
      .expect(404);
  });

  it('GET → deve retornar 400 para assignmentId inválido', async () => {
    const organizationId = await createOrganization();

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/assignments/invalid-id`)
      .expect(400);

    expect(response.body.message).toContain('Invalid assignment id');
  });
});
