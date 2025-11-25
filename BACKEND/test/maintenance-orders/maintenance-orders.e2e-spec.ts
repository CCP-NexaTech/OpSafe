import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';

import { AppModule } from '../../src/app.module';
import { DATABASE_CONNECTION } from '../../src/database/database.module';
import { JwtAuthGuard } from '../../src/auth/jwt-auth.guard';
import { RoleGuard } from '../../src/auth/role.guard';

describe('MaintenanceOrders (e2e)', () => {
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
        name: 'Org Maintenance',
        status: 'active',
      })
      .expect(201);

    return response.body.id as string;
  };

  const createEquipmentType = async (organizationId: string) => {
    const response = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/equipment-types`)
      .send({
        name: 'Equipamento Manutenção',
        category: 'Teste',
        description: 'Tipo usado em testes de manutenção',
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
        serialNumber: 'SN-MAN-001',
        assetTag: 'TAG-MAN-001',
        status: 'available',
        currentLocation: {
          type: 'stock',
        },
      })
      .expect(201);

    return response.body;
  };

  it('POST /organizations/:orgId/maintenance-orders → deve criar ordem e colocar equipamento em manutenção', async () => {
    const organizationId = await createOrganization();
    const equipmentTypeId = await createEquipmentType(organizationId);
    const equipment = await createEquipment(organizationId, equipmentTypeId);

    const response = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/maintenance-orders`)
      .send({
        equipmentId: equipment.id,
        type: 'preventive',
        description: 'Revisão anual',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.equipmentId).toBe(equipment.id);
    expect(response.body.type).toBe('preventive');
    expect(response.body.status).toBe('open');

    const equipmentResponse = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/equipments/${equipment.id}`)
      .expect(200);

    expect(equipmentResponse.body.status).toBe('inmaintenance');
  });

  it('GET /organizations/:orgId/maintenance-orders → deve listar ordens', async () => {
    const organizationId = await createOrganization();
    const equipmentTypeId = await createEquipmentType(organizationId);
    const equipment = await createEquipment(organizationId, equipmentTypeId);

    await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/maintenance-orders`)
      .send({
        equipmentId: equipment.id,
        type: 'corrective',
        description: 'Troca de bateria',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/maintenance-orders`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('GET /organizations/:orgId/maintenance-orders/:id → deve retornar ordem por ID', async () => {
    const organizationId = await createOrganization();
    const equipmentTypeId = await createEquipmentType(organizationId);
    const equipment = await createEquipment(organizationId, equipmentTypeId);

    const createResponse = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/maintenance-orders`)
      .send({
        equipmentId: equipment.id,
        type: 'corrective',
        description: 'Troca de componente',
      })
      .expect(201);

    const orderId = createResponse.body.id as string;

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/maintenance-orders/${orderId}`)
      .expect(200);

    expect(response.body.id).toBe(orderId);
    expect(response.body.equipmentId).toBe(equipment.id);
  });

  it('PATCH → deve atualizar status e descrição da ordem', async () => {
    const organizationId = await createOrganization();
    const equipmentTypeId = await createEquipmentType(organizationId);
    const equipment = await createEquipment(organizationId, equipmentTypeId);

    const createResponse = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/maintenance-orders`)
      .send({
        equipmentId: equipment.id,
        type: 'corrective',
        description: 'Manutenção inicial',
      })
      .expect(201);

    const orderId = createResponse.body.id as string;

    const response = await request(app.getHttpServer())
      .patch(`/organizations/${organizationId}/maintenance-orders/${orderId}`)
      .send({
        status: 'inprogress',
        description: 'Manutenção em andamento',
      })
      .expect(200);

    expect(response.body.status).toBe('inprogress');
    expect(response.body.description).toBe('Manutenção em andamento');
  });

  it('PATCH → ao fechar a ordem deve restaurar status do equipamento se não houver mais pendentes', async () => {
    const organizationId = await createOrganization();
    const equipmentTypeId = await createEquipmentType(organizationId);
    const equipment = await createEquipment(organizationId, equipmentTypeId);

    const createResponse = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/maintenance-orders`)
      .send({
        equipmentId: equipment.id,
        type: 'preventive',
        description: 'Revisão simples',
      })
      .expect(201);

    const orderId = createResponse.body.id as string;

    await request(app.getHttpServer())
      .patch(`/organizations/${organizationId}/maintenance-orders/${orderId}`)
      .send({
        status: 'closed',
        closedAt: new Date().toISOString(),
      })
      .expect(200);

    const equipmentResponse = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/equipments/${equipment.id}`)
      .expect(200);

    expect(equipmentResponse.body.status).toBe('available');
  });

  it('DELETE → deve realizar soft delete na ordem', async () => {
    const organizationId = await createOrganization();
    const equipmentTypeId = await createEquipmentType(organizationId);
    const equipment = await createEquipment(organizationId, equipmentTypeId);

    const createResponse = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/maintenance-orders`)
      .send({
        equipmentId: equipment.id,
        type: 'corrective',
        description: 'Teste delete',
      })
      .expect(201);

    const orderId = createResponse.body.id as string;

    await request(app.getHttpServer())
      .delete(`/organizations/${organizationId}/maintenance-orders/${orderId}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/maintenance-orders/${orderId}`)
      .expect(404);
  });

  it('GET → deve retornar 400 para maintenanceOrderId inválido', async () => {
    const organizationId = await createOrganization();

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/maintenance-orders/invalid-id`)
      .expect(400);

    expect(response.body.message).toContain('Invalid maintenance order id');
  });
});
