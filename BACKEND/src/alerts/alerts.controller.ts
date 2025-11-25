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
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { AlertResponseDto } from './dto/alert-response.dto';
import { Roles } from '../auth/role.decorator';

@ApiTags('Alerts')
@ApiBearerAuth()
@Controller()
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/organizations/:organizationId/alerts')
  @ApiOperation({ summary: 'Listar alertas da organização' })
  @ApiParam({
    name: 'organizationId',
    description: 'ID da organização',
    example: '675f3f3b5b1f4a2d1cbbbbbb',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de alertas retornada com sucesso.',
    type: AlertResponseDto,
    isArray: true,
  })
  async listAlerts(
    @Param('organizationId') organizationId: string,
  ): Promise<AlertResponseDto[]> {
    return this.alertsService.listAlerts(organizationId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/organizations/:organizationId/alerts/:alertId')
  @ApiOperation({ summary: 'Obter detalhes de um alerta pelo ID' })
  @ApiParam({
    name: 'organizationId',
    description: 'ID da organização',
    example: '675f3f3b5b1f4a2d1cbbbbbb',
  })
  @ApiParam({
    name: 'alertId',
    description: 'ID do alerta',
    example: '675f3f3b5b1f4a2d1caaaaaa',
  })
  @ApiResponse({
    status: 200,
    description: 'Alerta encontrado.',
    type: AlertResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Alert not found.' })
  async getAlertById(
    @Param('organizationId') organizationId: string,
    @Param('alertId') alertId: string,
  ): Promise<AlertResponseDto> {
    return this.alertsService.getAlertById(organizationId, alertId);
  }

  @Roles('admin', 'manager')
  @UseGuards(JwtAuthGuard)
  @Post('/organizations/:organizationId/alerts')
  @ApiOperation({ summary: 'Criar um novo alerta' })
  @ApiParam({
    name: 'organizationId',
    description: 'ID da organização',
    example: '675f3f3b5b1f4a2d1cbbbbbb',
  })
  @ApiResponse({
    status: 201,
    description: 'Alerta criado com sucesso.',
    type: AlertResponseDto,
  })
  async createAlert(
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateAlertDto,
  ): Promise<AlertResponseDto> {
    return this.alertsService.createAlert(organizationId, dto);
  }

  @Roles('admin', 'manager')
  @UseGuards(JwtAuthGuard)
  @Patch('/organizations/:organizationId/alerts/:alertId')
  @ApiOperation({ summary: 'Atualizar um alerta existente' })
  @ApiParam({
    name: 'organizationId',
    description: 'ID da organização',
  })
  @ApiParam({
    name: 'alertId',
    description: 'ID do alerta',
  })
  @ApiResponse({
    status: 200,
    description: 'Alerta atualizado com sucesso.',
    type: AlertResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Alert not found.' })
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
  @ApiOperation({ summary: 'Realizar soft delete de um alerta' })
  @ApiParam({
    name: 'organizationId',
    description: 'ID da organização',
  })
  @ApiParam({
    name: 'alertId',
    description: 'ID do alerta',
  })
  @ApiResponse({
    status: 200,
    description: 'Alerta removido (soft delete) com sucesso.',
  })
  @ApiResponse({ status: 404, description: 'Alert not found.' })
  async softDeleteAlert(
    @Param('organizationId') organizationId: string,
    @Param('alertId') alertId: string,
  ): Promise<{ success: true }> {
    await this.alertsService.softDeleteAlert(organizationId, alertId);
    return { success: true };
  }
}
