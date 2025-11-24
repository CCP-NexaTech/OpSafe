import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';

import { AppModule } from '../../src/app.module';
import { DATABASE_CONNECTION } from '../../src/database/database.module';
import { JwtAuthGuard } from '../../src/auth/jwt-auth.guard';
import { RoleGuard } from '../../src/auth/role.guard';

describe('Equipments (e2e)', () => {
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
        name: 'Org Equipments',
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
        category: 'COMMUNICATION',
        requiresValidity: false,
        requiresMaintenance: true,
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
        serialNumber: 'SN-0001',
        assetTag: 'TAG-0001',
        status: 'available',
        currentLocation: {
          type: 'stock',
        },
      })
      .expect(201);

    return response.body;
  };

  it('POST /organizations/:orgId/equipments → deve criar um equipamento', async () => {
    const organizationId = await createOrganization();
    const equipmentTypeId = await createEquipmentType(organizationId);

    const response = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/equipments`)
      .send({
        equipmentTypeId,
        serialNumber: 'SN-1234',
        assetTag: 'TAG-1234',
        status: 'available',
        currentLocation: {
          type: 'stock',
        },
        notes: 'Equipamento novo',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.assetTag).toBe('TAG-1234');
    expect(response.body.equipmentTypeId).toBe(equipmentTypeId);
    expect(response.body.status).toBe('available');
  });

  it('GET /organizations/:orgId/equipments → deve listar equipamentos', async () => {
    const organizationId = await createOrganization();
    const equipmentTypeId = await createEquipmentType(organizationId);
    await createEquipment(organizationId, equipmentTypeId);

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/equipments`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('GET /organizations/:orgId/equipments/:id → deve retornar equipamento por ID', async () => {
    const organizationId = await createOrganization();
    const equipmentTypeId = await createEquipmentType(organizationId);
    const equipment = await createEquipment(organizationId, equipmentTypeId);

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/equipments/${equipment.id}`)
      .expect(200);

    expect(response.body.id).toBe(equipment.id);
    expect(response.body.assetTag).toBe('TAG-0001');
  });

  it('PATCH → deve atualizar um equipamento', async () => {
    const organizationId = await createOrganization();
    const equipmentTypeId = await createEquipmentType(organizationId);
    const equipment = await createEquipment(organizationId, equipmentTypeId);

    const response = await request(app.getHttpServer())
      .patch(`/organizations/${organizationId}/equipments/${equipment.id}`)
      .send({
        status: 'inmaintenance',
        notes: 'Enviado para manutenção',
        currentLocation: {
          type: 'maintenanceProvider',
        },
      })
      .expect(200);

    expect(response.body.status).toBe('inmaintenance');
    expect(response.body.notes).toBe('Enviado para manutenção');
    expect(response.body.currentLocation.type).toBe('maintenanceProvider');
  });

  it('PATCH → deve bloquear assetTag duplicada na mesma organização', async () => {
    const organizationId = await createOrganization();
    const equipmentTypeId = await createEquipmentType(organizationId);

    const first = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/equipments`)
      .send({
        equipmentTypeId,
        assetTag: 'TAG-DUP-1',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/equipments`)
      .send({
        equipmentTypeId,
        assetTag: 'TAG-DUP-2',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .patch(`/organizations/${organizationId}/equipments/${first.body.id}`)
      .send({
        assetTag: 'TAG-DUP-2',
      })
      .expect(409);

    expect(response.body.message).toContain('assetTag');
  });

  it('DELETE → deve realizar soft delete no equipamento', async () => {
    const organizationId = await createOrganization();
    const equipmentTypeId = await createEquipmentType(organizationId);
    const equipment = await createEquipment(organizationId, equipmentTypeId);

    await request(app.getHttpServer())
      .delete(`/organizations/${organizationId}/equipments/${equipment.id}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/equipments/${equipment.id}`)
      .expect(404);
  });

  it('GET LIST → não deve listar equipamento deletado', async () => {
    const organizationId = await createOrganization();
    const equipmentTypeId = await createEquipmentType(organizationId);
    const equipment = await createEquipment(organizationId, equipmentTypeId);

    await request(app.getHttpServer())
      .delete(`/organizations/${organizationId}/equipments/${equipment.id}`)
      .expect(200);

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/equipments`)
      .expect(200);

    const ids = response.body.map((e: any) => e.id);
    expect(ids).not.toContain(equipment.id);
  });

  it('GET → deve retornar 400 para equipmentId inválido', async () => {
    const organizationId = await createOrganization();

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/equipments/invalid-id`)
      .expect(400);

    expect(response.body.message).toContain('Invalid equipment id');
  });
});
