import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ClientsService } from './clients.service';

import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import type { ClientResponseDto } from './dto/client-response.dto';
import { Roles } from '../auth/role.decorator';

@Controller()
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/organizations/:organizationId/clients')
  async listClients(
    @Param('organizationId') organizationId: string,
  ): Promise<ClientResponseDto[]> {
    return this.clientsService.listClients(organizationId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/organizations/:organizationId/clients/:clientId')
  async getClientById(
    @Param('organizationId') organizationId: string,
    @Param('clientId') clientId: string,
  ): Promise<ClientResponseDto> {
    return this.clientsService.getClientById(organizationId, clientId);
  }

  @Roles('admin', 'manager')
  @UseGuards(JwtAuthGuard)
  @Post('/organizations/:organizationId/clients')
  async createClient(
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateClientDto,
  ): Promise<ClientResponseDto> {
    return this.clientsService.createClient(organizationId, dto);
  }

  @Roles('admin', 'manager')
  @UseGuards(JwtAuthGuard)
  @Patch('/organizations/:organizationId/clients/:clientId')
  async updateClient(
    @Param('organizationId') organizationId: string,
    @Param('clientId') clientId: string,
    @Body() dto: UpdateClientDto,
  ): Promise<ClientResponseDto> {
    return this.clientsService.updateClient(organizationId, clientId, dto);
  }

  @Roles('admin', 'manager')
  @UseGuards(JwtAuthGuard)
  @Delete('/organizations/:organizationId/clients/:clientId')
  async softDeleteClient(
    @Param('organizationId') organizationId: string,
    @Param('clientId') clientId: string,
  ): Promise<{ success: true }> {
    await this.clientsService.softDeleteClient(organizationId, clientId);
    return { success: true };
  }
}
