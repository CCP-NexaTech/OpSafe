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
import { OperatorsService } from './operators.service';

import { CreateOperatorDto } from './dto/create-operator.dto';
import { UpdateOperatorDto } from './dto/update-operator.dto';
import type { OperatorResponseDto } from './dto/operator-response.dto';
import { Roles } from '../auth/role.decorator'

@Controller()
export class OperatorsController {
  constructor(private readonly operatorsService: OperatorsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/organizations/:organizationId/operators')
  async listOperators(
    @Param('organizationId') organizationId: string,
  ): Promise<OperatorResponseDto[]> {
    return this.operatorsService.listOperators(organizationId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/organizations/:organizationId/operators/:operatorId')
  async getOperatorById(
    @Param('organizationId') organizationId: string,
    @Param('operatorId') operatorId: string,
  ): Promise<OperatorResponseDto> {
    return this.operatorsService.getOperatorById(
      organizationId,
      operatorId,
    );
  }

  @Roles('admin', 'manager')
  @UseGuards(JwtAuthGuard)
  @Post('/organizations/:organizationId/operators')
  async createOperator(
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateOperatorDto,
  ): Promise<OperatorResponseDto> {
    return this.operatorsService.createOperator(organizationId, dto);
  }

  @Roles('admin', 'manager')
  @UseGuards(JwtAuthGuard)
  @Patch('/organizations/:organizationId/operators/:operatorId')
  async updateOperator(
    @Param('organizationId') organizationId: string,
    @Param('operatorId') operatorId: string,
    @Body() dto: UpdateOperatorDto,
  ): Promise<OperatorResponseDto> {
    return this.operatorsService.updateOperator(
      organizationId,
      operatorId,
      dto,
    );
  }

  @Roles('admin', 'manager')
  @UseGuards(JwtAuthGuard)
  @Delete('/organizations/:organizationId/operators/:operatorId')
  async softDeleteOperator(
    @Param('organizationId') organizationId: string,
    @Param('operatorId') operatorId: string,
  ): Promise<{ success: true }> {
    await this.operatorsService.softDeleteOperator(
      organizationId,
      operatorId,
    );
    return { success: true };
  }
}
