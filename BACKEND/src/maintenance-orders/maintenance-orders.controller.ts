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
import { MaintenanceOrdersService } from './maintenance-orders.service';
import { CreateMaintenanceOrderDto } from './dto/create-maintenance-order.dto';
import { UpdateMaintenanceOrderDto } from './dto/update-maintenance-order.dto';
import type { MaintenanceOrderResponseDto } from './dto/maintenance-order-response.dto';
import { Roles } from '../auth/role.decorator';

@Controller()
export class MaintenanceOrdersController {
  constructor(
    private readonly maintenanceOrdersService: MaintenanceOrdersService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('/organizations/:organizationId/maintenance-orders')
  async listMaintenanceOrders(
    @Param('organizationId') organizationId: string,
  ): Promise<MaintenanceOrderResponseDto[]> {
    return this.maintenanceOrdersService.listMaintenanceOrders(
      organizationId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('/organizations/:organizationId/maintenance-orders/:maintenanceOrderId')
  async getMaintenanceOrderById(
    @Param('organizationId') organizationId: string,
    @Param('maintenanceOrderId') maintenanceOrderId: string,
  ): Promise<MaintenanceOrderResponseDto> {
    return this.maintenanceOrdersService.getMaintenanceOrderById(
      organizationId,
      maintenanceOrderId,
    );
  }

  @Roles('admin', 'manager')
  @UseGuards(JwtAuthGuard)
  @Post('/organizations/:organizationId/maintenance-orders')
  async createMaintenanceOrder(
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateMaintenanceOrderDto,
  ): Promise<MaintenanceOrderResponseDto> {
    return this.maintenanceOrdersService.createMaintenanceOrder(
      organizationId,
      dto,
    );
  }

  @Roles('admin', 'manager')
  @UseGuards(JwtAuthGuard)
  @Patch('/organizations/:organizationId/maintenance-orders/:maintenanceOrderId')
  async updateMaintenanceOrder(
    @Param('organizationId') organizationId: string,
    @Param('maintenanceOrderId') maintenanceOrderId: string,
    @Body() dto: UpdateMaintenanceOrderDto,
  ): Promise<MaintenanceOrderResponseDto> {
    return this.maintenanceOrdersService.updateMaintenanceOrder(
      organizationId,
      maintenanceOrderId,
      dto,
    );
  }

  @Roles('admin', 'manager')
  @UseGuards(JwtAuthGuard)
  @Delete(
    '/organizations/:organizationId/maintenance-orders/:maintenanceOrderId',
  )
  async softDeleteMaintenanceOrder(
    @Param('organizationId') organizationId: string,
    @Param('maintenanceOrderId') maintenanceOrderId: string,
  ): Promise<{ success: true }> {
    await this.maintenanceOrdersService.softDeleteMaintenanceOrder(
      organizationId,
      maintenanceOrderId,
    );
    return { success: true };
  }
}
