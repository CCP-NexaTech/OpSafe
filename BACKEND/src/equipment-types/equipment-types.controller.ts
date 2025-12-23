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

import { EquipmentTypesService } from './equipment-types.service';
import { CreateEquipmentTypeDto } from './dto/create-equipment-type.dto';
import { UpdateEquipmentTypeDto } from './dto/update-equipment-type.dto';
import { EquipmentTypeResponseDto } from './dto/equipment-type-response.dto';

import {
  ErrorResponseDto,
  ValidationErrorResponseDto,
} from '../shared/dtos/error-response.dto';

@ApiTags('Equipment Types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('organizations/:organizationId/equipment-types')
export class EquipmentTypesController {
  constructor(
    private readonly equipmentTypesService: EquipmentTypesService,
  ) {}

  /**
   * List all equipment types (non-deleted) for an organization.
   *
   * Auth:
   * - Requires a valid JWT (Bearer token).
   *
   * Errors:
   * - 400: Invalid organization id.
   */
  @ApiOperation({
    summary: 'List equipment types',
    description:
      'Returns all equipment types for a given organization that are not soft-deleted.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiOkResponse({ type: EquipmentTypeResponseDto, isArray: true })
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
  async listEquipmentTypes(
    @Param('organizationId') organizationId: string,
  ): Promise<EquipmentTypeResponseDto[]> {
    return this.equipmentTypesService.listEquipmentTypes(organizationId);
  }

  /**
   * Get an equipment type by ID.
   *
   * Auth:
   * - Requires a valid JWT (Bearer token).
   *
   * Errors:
   * - 400: Invalid organization id OR invalid equipment type id.
   * - 404: Equipment type not found (or soft-deleted).
   */
  @ApiOperation({
    summary: 'Get equipment type by ID',
    description:
      'Returns a single equipment type by its ID within an organization. If not found or soft-deleted, returns 404.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiParam({
    name: 'equipmentTypeId',
    description: 'Equipment type ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7c9',
  })
  @ApiOkResponse({ type: EquipmentTypeResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid organization id or equipment type id.',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Equipment type not found.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @Get(':equipmentTypeId')
  async getEquipmentTypeById(
    @Param('organizationId') organizationId: string,
    @Param('equipmentTypeId') equipmentTypeId: string,
  ): Promise<EquipmentTypeResponseDto> {
    return this.equipmentTypesService.getEquipmentTypeById(
      organizationId,
      equipmentTypeId,
    );
  }

  /**
   * Create an equipment type.
   *
   * Auth:
   * - Requires a valid JWT (Bearer token).
   * - Requires role: admin or manager.
   *
   * Errors:
   * - 400: Validation errors OR invalid organization id.
   * - 409: Equipment type name already exists in this organization.
   */
  @ApiOperation({
    summary: 'Create equipment type',
    description:
      'Creates an equipment type inside an organization. The name must be unique per organization.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiCreatedResponse({ type: EquipmentTypeResponseDto })
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
  async createEquipmentType(
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateEquipmentTypeDto,
  ): Promise<EquipmentTypeResponseDto> {
    return this.equipmentTypesService.createEquipmentType(
      organizationId,
      dto,
    );
  }

  /**
   * Update an equipment type.
   *
   * Auth:
   * - Requires a valid JWT (Bearer token).
   * - Requires role: admin or manager.
   *
   * Errors:
   * - 400: Invalid ids OR validation errors in payload.
   * - 404: Equipment type not found (or soft-deleted).
   * - 409: Equipment type name already exists in this organization.
   */
  @ApiOperation({
    summary: 'Update equipment type',
    description:
      'Updates an equipment type by ID within an organization. Only non-deleted equipment types can be updated.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiParam({
    name: 'equipmentTypeId',
    description: 'Equipment type ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7c9',
  })
  @ApiOkResponse({ type: EquipmentTypeResponseDto })
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
    description: 'Equipment type not found.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @Roles('admin', 'manager')
  @Patch(':equipmentTypeId')
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

  /**
   * Soft delete an equipment type.
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
   * - 404: Equipment type not found (or already soft-deleted).
   */
  @ApiOperation({
    summary: 'Soft delete equipment type',
    description:
      'Soft deletes an equipment type by ID (sets `isDeleted=true` and timestamps).',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiParam({
    name: 'equipmentTypeId',
    description: 'Equipment type ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7c9',
  })
  @ApiOkResponse({
    description: 'Equipment type soft deleted.',
    schema: {
      type: 'object',
      properties: { success: { type: 'boolean', example: true } },
      required: ['success'],
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid organization id or equipment type id.',
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
    description: 'Equipment type not found.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @Roles('admin', 'manager')
  @Delete(':equipmentTypeId')
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
