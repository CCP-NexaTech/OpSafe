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
  ApiConflictResponse,
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

import { OperatorsService } from './operators.service';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { UpdateOperatorDto } from './dto/update-operator.dto';
import { OperatorResponseDto } from './dto/operator-response.dto';

import {
  ErrorResponseDto,
  ValidationErrorResponseDto,
} from '../shared/dtos/error-response.dto';

@ApiTags('Operators')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('organizations/:organizationId/operators')
export class OperatorsController {
  constructor(private readonly operatorsService: OperatorsService) {}

  /**
   * List all operators (non-deleted) for an organization.
   *
   * Auth:
   * - Requires a valid JWT (Bearer token).
   *
   * Errors:
   * - 400: Invalid organization id.
   */
  @ApiOperation({
    summary: 'List operators',
    description:
      'Returns all operators for a given organization that are not soft-deleted.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiOkResponse({ type: OperatorResponseDto, isArray: true })
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
  async listOperators(
    @Param('organizationId') organizationId: string,
  ): Promise<OperatorResponseDto[]> {
    return this.operatorsService.listOperators(organizationId);
  }

  /**
   * Get operator by id.
   *
   * Auth:
   * - Requires a valid JWT (Bearer token).
   *
   * Errors:
   * - 400: Invalid operator id OR invalid organization id.
   * - 404: Operator not found (or soft-deleted).
   */
  @ApiOperation({
    summary: 'Get operator by ID',
    description:
      'Returns a single operator by its ID within an organization. If not found or soft-deleted, returns 404.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiParam({
    name: 'operatorId',
    description: 'Operator ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b9',
  })
  @ApiOkResponse({ type: OperatorResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid organization id or operator id.',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Operator not found.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @Get(':operatorId')
  async getOperatorById(
    @Param('organizationId') organizationId: string,
    @Param('operatorId') operatorId: string,
  ): Promise<OperatorResponseDto> {
    return this.operatorsService.getOperatorById(organizationId, operatorId);
  }

  /**
   * Create an operator.
   *
   * Auth:
   * - Requires a valid JWT (Bearer token).
   * - Requires role: admin or manager.
   *
   * Errors:
   * - 400: Validation errors OR invalid organization id.
   * - 409: identifierCode already exists in this organization.
   */
  @ApiOperation({
    summary: 'Create operator',
    description:
      'Creates an operator inside an organization. `identifierCode` must be unique per organization.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiCreatedResponse({ type: OperatorResponseDto })
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
  @ApiConflictResponse({
    description: 'identifierCode already exists in this organization.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @Roles('admin', 'manager')
  @Post()
  async createOperator(
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateOperatorDto,
  ): Promise<OperatorResponseDto> {
    return this.operatorsService.createOperator(organizationId, dto);
  }

  /**
   * Update an operator.
   *
   * Auth:
   * - Requires a valid JWT (Bearer token).
   * - Requires role: admin or manager.
   *
   * Errors:
   * - 400: Invalid ids OR validation errors in payload.
   * - 404: Operator not found (or soft-deleted).
   * - 409: identifierCode already exists in this organization.
   */
  @ApiOperation({
    summary: 'Update operator',
    description:
      'Updates an operator by ID within an organization. Only non-deleted operators can be updated.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiParam({
    name: 'operatorId',
    description: 'Operator ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b9',
  })
  @ApiOkResponse({ type: OperatorResponseDto })
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
    description: 'Operator not found.',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'identifierCode already exists in this organization.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @Roles('admin', 'manager')
  @Patch(':operatorId')
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

  /**
   * Soft delete an operator.
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
   * - 404: Operator not found (or already soft-deleted).
   */
  @ApiOperation({
    summary: 'Soft delete operator',
    description:
      'Soft deletes an operator by ID (sets `isDeleted=true` and timestamps).',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiParam({
    name: 'operatorId',
    description: 'Operator ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b9',
  })
  @ApiOkResponse({
    description: 'Operator soft deleted.',
    schema: {
      type: 'object',
      properties: { success: { type: 'boolean', example: true } },
      required: ['success'],
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid organization id or operator id.',
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
    description: 'Operator not found.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @Roles('admin', 'manager')
  @Delete(':operatorId')
  async softDeleteOperator(
    @Param('organizationId') organizationId: string,
    @Param('operatorId') operatorId: string,
  ): Promise<{ success: true }> {
    await this.operatorsService.softDeleteOperator(organizationId, operatorId);
    return { success: true };
  }
}
