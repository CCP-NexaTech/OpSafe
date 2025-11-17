import { Module, Global } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';

export const TEST_DB_CONNECTION = 'TEST_DB_CONNECTION';

@Global()
@Module({
  providers: [
    {
      provide: TEST_DB_CONNECTION,
      useFactory: async (): Promise<Db> => {
        const mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        const client = await MongoClient.connect(uri);
        return client.db('opsafe_test');
      },
    },
  ],
  exports: [TEST_DB_CONNECTION],
})
export class TestDatabaseModule {}
