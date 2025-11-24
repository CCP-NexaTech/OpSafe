import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EquipmentTypesService } from './equipment-types.service';
import { CreateEquipmentTypeDto } from './dto/create-equipment-type.dto';
import { UpdateEquipmentTypeDto } from './dto/update-equipment-type.dto';
import type { EquipmentTypeResponseDto } from './dto/equipment-type-response.dto';
import { Roles } from '../auth/role.decorator';

@Controller()
export class EquipmentTypesController {
  constructor(
    private readonly equipmentTypesService: EquipmentTypesService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('/organizations/:organizationId/equipment-types')
  async listEquipmentTypes(
    @Param('organizationId') organizationId: string,
  ): Promise<EquipmentTypeResponseDto[]> {
    return this.equipmentTypesService.listEquipmentTypes(organizationId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/organizations/:organizationId/equipment-types/:equipmentTypeId')
  async getEquipmentTypeById(
    @Param('organizationId') organizationId: string,
    @Param('equipmentTypeId') equipmentTypeId: string,
  ): Promise<EquipmentTypeResponseDto> {
    return this.equipmentTypesService.getEquipmentTypeById(
      organizationId,
      equipmentTypeId,
    );
  }

  @Roles('admin', 'manager')
  @UseGuards(JwtAuthGuard)
  @Post('/organizations/:organizationId/equipment-types')
  async createEquipmentType(
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateEquipmentTypeDto,
  ): Promise<EquipmentTypeResponseDto> {
    return this.equipmentTypesService.createEquipmentType(
      organizationId,
      dto,
    );
  }

  @Roles('admin', 'manager')
  @UseGuards(JwtAuthGuard)
  @Patch('/organizations/:organizationId/equipment-types/:equipmentTypeId')
  async updateEquipmentType(
    @Param('organizationId') organizationId: string,
    @Param('equipmentTypeId') equipmentTypeId: string,
    @Body() dto: UpdateEquipmentTypeDto,
  ): Promise<EquipmentTypeResponseDto> {
    return this.equipmentTypesService.updateEquipmentType(
      organizationId,
      equipmentTypeId,
      dto,
    );
  }

  @Roles('admin', 'manager')
  @UseGuards(JwtAuthGuard)
  @Delete('/organizations/:organizationId/equipment-types/:equipmentTypeId')
  async softDeleteEquipmentType(
    @Param('organizationId') organizationId: string,
    @Param('equipmentTypeId') equipmentTypeId: string,
  ): Promise<{ success: true }> {
    await this.equipmentTypesService.softDeleteEquipmentType(
      organizationId,
      equipmentTypeId,
    );
    return { success: true };
  }
}
