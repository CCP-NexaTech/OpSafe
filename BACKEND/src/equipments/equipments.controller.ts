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

import { EquipmentsService } from './equipments.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { EquipmentResponseDto } from './dto/equipment-response.dto';

import {
  ErrorResponseDto,
  ValidationErrorResponseDto,
} from '../shared/dtos/error-response.dto';

@ApiTags('Equipments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('organizations/:organizationId/equipments')
export class EquipmentsController {
  constructor(private readonly equipmentsService: EquipmentsService) {}

  /**
   * List all equipments (non-deleted) for an organization.
   */
  @ApiOperation({
    summary: 'List equipments',
    description:
      'Returns all equipments for a given organization that are not soft-deleted.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiOkResponse({ type: EquipmentResponseDto, isArray: true })
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
  async listEquipments(
    @Param('organizationId') organizationId: string,
  ): Promise<EquipmentResponseDto[]> {
    return this.equipmentsService.listEquipments(organizationId);
  }

  /**
   * Get an equipment by ID.
   */
  @ApiOperation({
    summary: 'Get equipment by ID',
    description:
      'Returns a single equipment by its ID within an organization. If not found or soft-deleted, returns 404.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiParam({
    name: 'equipmentId',
    description: 'Equipment ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7ee',
  })
  @ApiOkResponse({ type: EquipmentResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid organization id or equipment id.',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Equipment not found.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @Get(':equipmentId')
  async getEquipmentById(
    @Param('organizationId') organizationId: string,
    @Param('equipmentId') equipmentId: string,
  ): Promise<EquipmentResponseDto> {
    return this.equipmentsService.getEquipmentById(
      organizationId,
      equipmentId,
    );
  }

  /**
   * Create an equipment.
   */
  @ApiOperation({
    summary: 'Create equipment',
    description: 'Creates an equipment inside an organization.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiCreatedResponse({ type: EquipmentResponseDto })
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
  async createEquipment(
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateEquipmentDto,
  ): Promise<EquipmentResponseDto> {
    return this.equipmentsService.createEquipment(organizationId, dto);
  }

  /**
   * Update an equipment.
   */
  @ApiOperation({
    summary: 'Update equipment',
    description:
      'Updates an equipment by ID within an organization. Only non-deleted equipments can be updated.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiParam({
    name: 'equipmentId',
    description: 'Equipment ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7ee',
  })
  @ApiOkResponse({ type: EquipmentResponseDto })
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
    description: 'Equipment not found.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @Roles('admin', 'manager')
  @Patch(':equipmentId')
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

  /**
   * Soft delete an equipment.
   */
  @ApiOperation({
    summary: 'Soft delete equipment',
    description:
      'Soft deletes an equipment by ID (sets `isDeleted=true` and timestamps).',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiParam({
    name: 'equipmentId',
    description: 'Equipment ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7ee',
  })
  @ApiOkResponse({
    description: 'Equipment soft deleted.',
    schema: {
      type: 'object',
      properties: { success: { type: 'boolean', example: true } },
      required: ['success'],
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid organization id or equipment id.',
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
    description: 'Equipment not found.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @Roles('admin', 'manager')
  @Delete(':equipmentId')
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
