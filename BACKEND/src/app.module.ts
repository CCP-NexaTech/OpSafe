import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { UsersModule } from './users/users.module';
import { NotificationsModule } from './notifications/notifications.module'
import { AuthModule } from './auth/auth.module';
import { OperatorsModule } from './operators/operators.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    HealthModule,
    OrganizationsModule,
    UsersModule,
    NotificationsModule,
    AuthModule,
    OperatorsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
