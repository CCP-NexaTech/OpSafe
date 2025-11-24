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
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import type { ContractResponseDto } from './dto/contract-response.dto';
import { Roles } from '../auth/role.decorator';

@Controller()
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/organizations/:organizationId/contracts')
  async listContracts(
    @Param('organizationId') organizationId: string,
  ): Promise<ContractResponseDto[]> {
    return this.contractsService.listContracts(organizationId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/organizations/:organizationId/contracts/:contractId')
  async getContractById(
    @Param('organizationId') organizationId: string,
    @Param('contractId') contractId: string,
  ): Promise<ContractResponseDto> {
    return this.contractsService.getContractById(
      organizationId,
      contractId,
    );
  }

  @Roles('admin', 'manager')
  @UseGuards(JwtAuthGuard)
  @Post('/organizations/:organizationId/contracts')
  async createContract(
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateContractDto,
  ): Promise<ContractResponseDto> {
    return this.contractsService.createContract(organizationId, dto);
  }

  @Roles('admin', 'manager')
  @UseGuards(JwtAuthGuard)
  @Patch('/organizations/:organizationId/contracts/:contractId')
  async updateContract(
    @Param('organizationId') organizationId: string,
    @Param('contractId') contractId: string,
    @Body() dto: UpdateContractDto,
  ): Promise<ContractResponseDto> {
    return this.contractsService.updateContract(
      organizationId,
      contractId,
      dto,
    );
  }

  @Roles('admin', 'manager')
  @UseGuards(JwtAuthGuard)
  @Delete('/organizations/:organizationId/contracts/:contractId')
  async softDeleteContract(
    @Param('organizationId') organizationId: string,
    @Param('contractId') contractId: string,
  ): Promise<{ success: true }> {
    await this.contractsService.softDeleteContract(
      organizationId,
      contractId,
    );
    return { success: true };
  }
}
