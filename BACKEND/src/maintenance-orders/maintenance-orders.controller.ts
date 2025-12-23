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

import { MaintenanceOrdersService } from './maintenance-orders.service';
import { CreateMaintenanceOrderDto } from './dto/create-maintenance-order.dto';
import { UpdateMaintenanceOrderDto } from './dto/update-maintenance-order.dto';
import { MaintenanceOrderResponseDto } from './dto/maintenance-order-response.dto';

import {
  ErrorResponseDto,
  ValidationErrorResponseDto,
} from '../shared/dtos/error-response.dto';

@ApiTags('Maintenance Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('organizations/:organizationId/maintenance-orders')
export class MaintenanceOrdersController {
  constructor(
    private readonly maintenanceOrdersService: MaintenanceOrdersService,
  ) {}

  /**
   * List all maintenance orders (non-deleted) for an organization.
   *
   * Auth:
   * - Requires a valid JWT (Bearer token).
   *
   * Errors:
   * - 400: Invalid organization id.
   */
  @ApiOperation({
    summary: 'List maintenance orders',
    description:
      'Returns all maintenance orders for a given organization that are not soft-deleted.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiOkResponse({ type: MaintenanceOrderResponseDto, isArray: true })
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
  async listMaintenanceOrders(
    @Param('organizationId') organizationId: string,
  ): Promise<MaintenanceOrderResponseDto[]> {
    return this.maintenanceOrdersService.listMaintenanceOrders(
      organizationId,
    );
  }

  /**
   * Get a maintenance order by ID.
   *
   * Auth:
   * - Requires a valid JWT (Bearer token).
   *
   * Errors:
   * - 400: Invalid organization id OR invalid maintenance order id.
   * - 404: Maintenance order not found (or soft-deleted).
   */
  @ApiOperation({
    summary: 'Get maintenance order by ID',
    description:
      'Returns a single maintenance order by its ID within an organization. If not found or soft-deleted, returns 404.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiParam({
    name: 'maintenanceOrderId',
    description: 'Maintenance order ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7cd',
  })
  @ApiOkResponse({ type: MaintenanceOrderResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid organization id or maintenance order id.',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Maintenance order not found.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @Get(':maintenanceOrderId')
  async getMaintenanceOrderById(
    @Param('organizationId') organizationId: string,
    @Param('maintenanceOrderId') maintenanceOrderId: string,
  ): Promise<MaintenanceOrderResponseDto> {
    return this.maintenanceOrdersService.getMaintenanceOrderById(
      organizationId,
      maintenanceOrderId,
    );
  }

  /**
   * Create a maintenance order.
   *
   * Auth:
   * - Requires a valid JWT (Bearer token).
   * - Requires role: admin or manager.
   *
   * Errors:
   * - 400: Invalid organization id OR validation errors in payload.
   */
  @ApiOperation({
    summary: 'Create maintenance order',
    description: 'Creates a maintenance order inside an organization.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiCreatedResponse({ type: MaintenanceOrderResponseDto })
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
  async createMaintenanceOrder(
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateMaintenanceOrderDto,
  ): Promise<MaintenanceOrderResponseDto> {
    return this.maintenanceOrdersService.createMaintenanceOrder(
      organizationId,
      dto,
    );
  }

  /**
   * Update a maintenance order.
   *
   * Auth:
   * - Requires a valid JWT (Bearer token).
   * - Requires role: admin or manager.
   *
   * Errors:
   * - 400: Invalid ids OR validation errors in payload.
   * - 404: Maintenance order not found (or soft-deleted).
   */
  @ApiOperation({
    summary: 'Update maintenance order',
    description:
      'Updates a maintenance order by ID within an organization. Only non-deleted maintenance orders can be updated.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiParam({
    name: 'maintenanceOrderId',
    description: 'Maintenance order ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7cd',
  })
  @ApiOkResponse({ type: MaintenanceOrderResponseDto })
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
    description: 'Maintenance order not found.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @Roles('admin', 'manager')
  @Patch(':maintenanceOrderId')
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

  /**
   * Soft delete a maintenance order.
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
   * - 404: Maintenance order not found (or already soft-deleted).
   */
  @ApiOperation({
    summary: 'Soft delete maintenance order',
    description:
      'Soft deletes a maintenance order by ID (sets `isDeleted=true` and timestamps).',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiParam({
    name: 'maintenanceOrderId',
    description: 'Maintenance order ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7cd',
  })
  @ApiOkResponse({
    description: 'Maintenance order soft deleted.',
    schema: {
      type: 'object',
      properties: { success: { type: 'boolean', example: true } },
      required: ['success'],
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid organization id or maintenance order id.',
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
    description: 'Maintenance order not found.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @Roles('admin', 'manager')
  @Delete(':maintenanceOrderId')
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
