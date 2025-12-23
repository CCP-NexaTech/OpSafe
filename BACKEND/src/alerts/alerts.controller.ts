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

import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { AlertResponseDto } from './dto/alert-response.dto';

import {
  ErrorResponseDto,
  ValidationErrorResponseDto,
} from '../shared/dtos/error-response.dto';

@ApiTags('Alerts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('organizations/:organizationId/alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  /**
   * List all alerts (non-deleted) for an organization.
   *
   * Auth:
   * - Requires a valid JWT (Bearer token).
   *
   * Errors:
   * - 400: Invalid organization id.
   */
  @ApiOperation({
    summary: 'List alerts',
    description:
      'Returns all alerts for a given organization that are not soft-deleted.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '675f3f3b5b1f4a2d1cbbbbbb',
  })
  @ApiOkResponse({ type: AlertResponseDto, isArray: true })
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
  async listAlerts(
    @Param('organizationId') organizationId: string,
  ): Promise<AlertResponseDto[]> {
    return this.alertsService.listAlerts(organizationId);
  }

  /**
   * Get an alert by ID.
   *
   * Auth:
   * - Requires a valid JWT (Bearer token).
   *
   * Errors:
   * - 400: Invalid organization id OR invalid alert id.
   * - 404: Alert not found (or soft-deleted).
   */
  @ApiOperation({
    summary: 'Get alert by ID',
    description:
      'Returns a single alert by its ID within an organization. If not found or soft-deleted, returns 404.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '675f3f3b5b1f4a2d1cbbbbbb',
  })
  @ApiParam({
    name: 'alertId',
    description: 'Alert ID (MongoDB ObjectId).',
    example: '675f3f3b5b1f4a2d1caaaaaa',
  })
  @ApiOkResponse({ type: AlertResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid organization id or alert id.',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Alert not found.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @Get(':alertId')
  async getAlertById(
    @Param('organizationId') organizationId: string,
    @Param('alertId') alertId: string,
  ): Promise<AlertResponseDto> {
    return this.alertsService.getAlertById(organizationId, alertId);
  }

  /**
   * Create an alert.
   *
   * Auth:
   * - Requires a valid JWT (Bearer token).
   * - Requires role: admin or manager.
   *
   * Errors:
   * - 400: Invalid organization id OR validation errors in payload.
   */
  @ApiOperation({
    summary: 'Create alert',
    description: 'Creates an alert inside an organization.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '675f3f3b5b1f4a2d1cbbbbbb',
  })
  @ApiCreatedResponse({ type: AlertResponseDto })
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
  async createAlert(
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateAlertDto,
  ): Promise<AlertResponseDto> {
    return this.alertsService.createAlert(organizationId, dto);
  }

  /**
   * Update an alert.
   *
   * Auth:
   * - Requires a valid JWT (Bearer token).
   * - Requires role: admin or manager.
   *
   * Errors:
   * - 400: Invalid ids OR validation errors in payload.
   * - 404: Alert not found (or soft-deleted).
   */
  @ApiOperation({
    summary: 'Update alert',
    description:
      'Updates an alert by ID within an organization. Only non-deleted alerts can be updated.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '675f3f3b5b1f4a2d1cbbbbbb',
  })
  @ApiParam({
    name: 'alertId',
    description: 'Alert ID (MongoDB ObjectId).',
    example: '675f3f3b5b1f4a2d1caaaaaa',
  })
  @ApiOkResponse({ type: AlertResponseDto })
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
    description: 'Alert not found.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @Roles('admin', 'manager')
  @Patch(':alertId')
  async updateAlert(
    @Param('organizationId') organizationId: string,
    @Param('alertId') alertId: string,
    @Body() dto: UpdateAlertDto,
  ): Promise<AlertResponseDto> {
    return this.alertsService.updateAlert(organizationId, alertId, dto);
  }

  /**
   * Soft delete an alert.
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
   * - 404: Alert not found (or already soft-deleted).
   */
  @ApiOperation({
    summary: 'Soft delete alert',
    description:
      'Soft deletes an alert by ID (sets `isDeleted=true` and timestamps).',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '675f3f3b5b1f4a2d1cbbbbbb',
  })
  @ApiParam({
    name: 'alertId',
    description: 'Alert ID (MongoDB ObjectId).',
    example: '675f3f3b5b1f4a2d1caaaaaa',
  })
  @ApiOkResponse({
    description: 'Alert soft deleted.',
    schema: {
      type: 'object',
      properties: { success: { type: 'boolean', example: true } },
      required: ['success'],
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid organization id or alert id.',
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
    description: 'Alert not found.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @Roles('admin', 'manager')
  @Delete(':alertId')
  async softDeleteAlert(
    @Param('organizationId') organizationId: string,
    @Param('alertId') alertId: string,
  ): Promise<{ success: true }> {
    await this.alertsService.softDeleteAlert(organizationId, alertId);
    return { success: true };
  }
}
