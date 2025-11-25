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
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import type { AlertResponseDto } from './dto/alert-response.dto';
import { Roles } from '../auth/role.decorator';

@Controller()
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/organizations/:organizationId/alerts')
  async listAlerts(
    @Param('organizationId') organizationId: string,
  ): Promise<AlertResponseDto[]> {
    return this.alertsService.listAlerts(organizationId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/organizations/:organizationId/alerts/:alertId')
  async getAlertById(
    @Param('organizationId') organizationId: string,
    @Param('alertId') alertId: string,
  ): Promise<AlertResponseDto> {
    return this.alertsService.getAlertById(organizationId, alertId);
  }

  @Roles('admin', 'manager')
  @UseGuards(JwtAuthGuard)
  @Post('/organizations/:organizationId/alerts')
  async createAlert(
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateAlertDto,
  ): Promise<AlertResponseDto> {
    return this.alertsService.createAlert(organizationId, dto);
  }

  @Roles('admin', 'manager')
  @UseGuards(JwtAuthGuard)
  @Patch('/organizations/:organizationId/alerts/:alertId')
  async updateAlert(
    @Param('organizationId') organizationId: string,
    @Param('alertId') alertId: string,
    @Body() dto: UpdateAlertDto,
  ): Promise<AlertResponseDto> {
    return this.alertsService.updateAlert(organizationId, alertId, dto);
  }

  @Roles('admin', 'manager')
  @UseGuards(JwtAuthGuard)
  @Delete('/organizations/:organizationId/alerts/:alertId')
  async softDeleteAlert(
    @Param('organizationId') organizationId: string,
    @Param('alertId') alertId: string,
  ): Promise<{ success: true }> {
    await this.alertsService.softDeleteAlert(organizationId, alertId);
    return { success: true };
  }
}
