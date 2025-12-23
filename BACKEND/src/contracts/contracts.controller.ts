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
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/role.decorator';

import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { ContractResponseDto } from './dto/contract-response.dto';

import {
  ErrorResponseDto,
  ValidationErrorResponseDto,
} from '../shared/dtos/error-response.dto';

@ApiTags('Contracts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('organizations/:organizationId/contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  /**
   * List all contracts (non-deleted) for an organization.
   *
   * Auth:
   * - Requires a valid JWT (Bearer token).
   *
   * Errors:
   * - 400: Invalid organization id.
   */
  @ApiOperation({
    summary: 'List contracts',
    description:
      'Returns all contracts for a given organization that are not soft-deleted.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiOkResponse({ type: ContractResponseDto, isArray: true })
  @ApiBadRequestResponse({
    description: 'Invalid organization id.',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @Get()
  async listContracts(
    @Param('organizationId') organizationId: string,
  ): Promise<ContractResponseDto[]> {
    return this.contractsService.listContracts(organizationId);
  }

  /**
   * Get a contract by ID.
   *
   * Auth:
   * - Requires a valid JWT (Bearer token).
   *
   * Errors:
   * - 400: Invalid organization id OR invalid contract id.
   * - 404: Contract not found (or soft-deleted).
   */
  @ApiOperation({
    summary: 'Get contract by ID',
    description:
      'Returns a single contract by its ID within an organization. If not found or soft-deleted, returns 404.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiParam({
    name: 'contractId',
    description: 'Contract ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b9',
  })
  @ApiOkResponse({ type: ContractResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid organization id or contract id.',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Contract not found.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @Get(':contractId')
  async getContractById(
    @Param('organizationId') organizationId: string,
    @Param('contractId') contractId: string,
  ): Promise<ContractResponseDto> {
    return this.contractsService.getContractById(organizationId, contractId);
  }

  /**
   * Create a contract.
   *
   * Auth:
   * - Requires a valid JWT (Bearer token).
   * - Requires role: admin or manager.
   *
   * Errors:
   * - 400: Validation errors OR invalid organization id.
   */
  @ApiOperation({
    summary: 'Create contract',
    description: 'Creates a contract inside an organization.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiCreatedResponse({ type: ContractResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid organization id or invalid request body.',
    type: ValidationErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT.',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions (requires admin or manager).',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @Roles('admin', 'manager')
  @Post()
  async createContract(
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateContractDto,
  ): Promise<ContractResponseDto> {
    return this.contractsService.createContract(organizationId, dto);
  }

  /**
   * Update a contract.
   *
   * Auth:
   * - Requires a valid JWT (Bearer token).
   * - Requires role: admin or manager.
   *
   * Errors:
   * - 400: Invalid ids OR validation errors in payload.
   * - 404: Contract not found (or soft-deleted).
   */
  @ApiOperation({
    summary: 'Update contract',
    description:
      'Updates a contract by ID within an organization. Only non-deleted contracts can be updated.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiParam({
    name: 'contractId',
    description: 'Contract ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b9',
  })
  @ApiOkResponse({ type: ContractResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid ids or invalid request body.',
    type: ValidationErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT.',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions (requires admin or manager).',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Contract not found.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @Roles('admin', 'manager')
  @Patch(':contractId')
  async updateContract(
    @Param('organizationId') organizationId: string,
    @Param('contractId') contractId: string,
    @Body() dto: UpdateContractDto,
  ): Promise<ContractResponseDto> {
    return this.contractsService.updateContract(organizationId, contractId, dto);
  }

  /**
   * Soft delete a contract.
   *
   * Auth:
   * - Requires a valid JWT (Bearer token).
   * - Requires role: admin or manager.
   *
   * Notes:
   * - Soft delete (sets `isDeleted=true`).
   *
   * Errors:
   * - 400: Invalid ids.
   * - 404: Contract not found (or already soft-deleted).
   */
  @ApiOperation({
    summary: 'Soft delete contract',
    description:
      'Soft deletes a contract by ID (sets `isDeleted=true` and timestamps).',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiParam({
    name: 'contractId',
    description: 'Contract ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b9',
  })
  @ApiOkResponse({
    description: 'Contract soft deleted.',
    schema: {
      type: 'object',
      properties: { success: { type: 'boolean', example: true } },
      required: ['success'],
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid organization id or contract id.',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT.',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions (requires admin or manager).',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Contract not found.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @Roles('admin', 'manager')
  @Delete(':contractId')
  async softDeleteContract(
    @Param('organizationId') organizationId: string,
    @Param('contractId') contractId: string,
  ): Promise<{ success: true }> {
    await this.contractsService.softDeleteContract(organizationId, contractId);
    return { success: true };
  }
}
