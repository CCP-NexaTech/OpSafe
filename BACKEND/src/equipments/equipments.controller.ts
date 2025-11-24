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
import { EquipmentsService } from './equipments.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import type { EquipmentResponseDto } from './dto/equipment-response.dto';
import { Roles } from '../auth/role.decorator';

@Controller()
export class EquipmentsController {
  constructor(private readonly equipmentsService: EquipmentsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/organizations/:organizationId/equipments')
  async listEquipments(
    @Param('organizationId') organizationId: string,
  ): Promise<EquipmentResponseDto[]> {
    return this.equipmentsService.listEquipments(organizationId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/organizations/:organizationId/equipments/:equipmentId')
  async getEquipmentById(
    @Param('organizationId') organizationId: string,
    @Param('equipmentId') equipmentId: string,
  ): Promise<EquipmentResponseDto> {
    return this.equipmentsService.getEquipmentById(
      organizationId,
      equipmentId,
    );
  }

  @Roles('admin', 'manager')
  @UseGuards(JwtAuthGuard)
  @Post('/organizations/:organizationId/equipments')
  async createEquipment(
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateEquipmentDto,
  ): Promise<EquipmentResponseDto> {
    return this.equipmentsService.createEquipment(organizationId, dto);
  }

  @Roles('admin', 'manager')
  @UseGuards(JwtAuthGuard)
  @Patch('/organizations/:organizationId/equipments/:equipmentId')
  async updateEquipment(
    @Param('organizationId') organizationId: string,
    @Param('equipmentId') equipmentId: string,
    @Body() dto: UpdateEquipmentDto,
  ): Promise<EquipmentResponseDto> {
    return this.equipmentsService.updateEquipment(
      organizationId,
      equipmentId,
      dto,
    );
  }

  @Roles('admin', 'manager')
  @UseGuards(JwtAuthGuard)
  @Delete('/organizations/:organizationId/equipments/:equipmentId')
  async softDeleteEquipment(
    @Param('organizationId') organizationId: string,
    @Param('equipmentId') equipmentId: string,
  ): Promise<{ success: true }> {
    await this.equipmentsService.softDeleteEquipment(
      organizationId,
      equipmentId,
    );
    return { success: true };
  }
}
