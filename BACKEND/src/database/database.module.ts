import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Db, MongoClient } from 'mongodb';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: async (configService: ConfigService): Promise<Db> => {
        const uri = configService.get<string>('MONGO_URI');
        const dbName = configService.get<string>('MONGO_DB');

        if (!uri || !dbName) {
          throw new Error('MONGO_URI ou MONGO_DB não configurados no .env');
        }

        const client = new MongoClient(uri, {
          connectTimeoutMS: 5000,
          serverSelectionTimeoutMS: 5000,
        });

        await client.connect();
        const db = client.db(dbName);
        console.log(`✅ MongoDB conectado em: ${dbName}`);
        return db;
      },
      inject: [ConfigService],
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
