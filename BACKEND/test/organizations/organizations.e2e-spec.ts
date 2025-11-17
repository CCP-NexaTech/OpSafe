import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';

import { AppModule } from '../../src/app.module';
import { DATABASE_CONNECTION } from '../../src/database/database.module';

describe('Organizations (e2e)', () => {
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

    await request(app.getHttpServer())
      .get(`/organizations/${id}`)
      .expect(404);
  });
});
