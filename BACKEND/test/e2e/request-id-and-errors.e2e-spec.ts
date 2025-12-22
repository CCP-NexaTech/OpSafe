import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';

import { AppModule } from '../../src/app.module';
import { DATABASE_CONNECTION } from '../../src/database/database.module';
import { JwtAuthGuard } from '../../src/auth/jwt-auth.guard';

import { requestIdMiddleware } from '../../src/shared/middlewares/request-id.middleware';
import { GlobalExceptionFilter } from '../../src/shared/filters/global-exception.filter';

describe('RequestId + GlobalExceptionFilter (e2e)', () => {
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
      .overrideProvider(DATABASE_CONNECTION)
      .useValue(db)
      .compile();

    app = moduleFixture.createNestApplication();

    app.use(requestIdMiddleware);
    app.useGlobalFilters(new GlobalExceptionFilter());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
    if (mongod) await mongod.stop();
  });

  it('should generate x-request-id and include requestId in error body', async () => {
    const response = await request(app.getHttpServer())
      .get('/organizations/does-not-exist')
      .expect(404);

    const headerRequestId = response.headers['x-request-id'] as string | undefined;

    expect(headerRequestId).toBeDefined();
    expect(typeof headerRequestId).toBe('string');
    expect(headerRequestId!.length).toBeGreaterThan(10);

    expect(response.body).toMatchObject({
      statusCode: 404,
      path: '/organizations/does-not-exist',
    });

    expect(response.body).toHaveProperty('error');
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('requestId');

    expect(response.body.requestId).toBe(headerRequestId);
  });

  it('should preserve x-request-id when provided', async () => {
    const response = await request(app.getHttpServer())
      .get('/organizations/does-not-exist')
      .set('x-request-id', 'test-request-123')
      .expect(404);

    expect(response.headers['x-request-id']).toBe('test-request-123');
    expect(response.body.requestId).toBe('test-request-123');
  });
});
