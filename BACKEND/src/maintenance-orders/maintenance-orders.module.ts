import { Module } from '@nestjs/common';
import { MaintenanceOrdersService } from './maintenance-orders.service';
import { MaintenanceOrdersController } from './maintenance-orders.controller';

@Module({
  providers: [MaintenanceOrdersService],
  controllers: [MaintenanceOrdersController]
})
export class MaintenanceOrdersModule {}
