import { Module } from '@nestjs/common';
import { EquipmentTypesService } from './equipment-types.service';
import { EquipmentTypesController } from './equipment-types.controller';

@Module({
  providers: [EquipmentTypesService],
  controllers: [EquipmentTypesController]
})
export class EquipmentTypesModule {}
