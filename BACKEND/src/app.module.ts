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
import { ClientsModule } from './clients/clients.module';
import { ContractsModule } from './contracts/contracts.module';
import { EquipmentTypesModule } from './equipment-types/equipment-types.module';
import { PostsModule } from './posts/posts.module';
import { EquipmentsModule } from './equipments/equipments.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { TermsModule } from './terms/terms.module';
import { MaintenanceOrdersModule } from './maintenance-orders/maintenance-orders.module';
import { AlertsModule } from './alerts/alerts.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { CustomFieldsModule } from './custom-fields/custom-fields.module';

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
    ClientsModule,
    ContractsModule,
    EquipmentTypesModule,
    PostsModule,
    EquipmentsModule,
    AssignmentsModule,
    TermsModule,
    MaintenanceOrdersModule,
    AlertsModule,
    AuditLogsModule,
    CustomFieldsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
