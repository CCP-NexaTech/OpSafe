// BACKEND/src/audit-logs/audit-logs.controller.ts
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
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { AuditLogsService } from './audit-logs.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { UpdateAuditLogDto } from './dto/update-audit-log.dto';
import { AuditLogResponseDto } from './dto/audit-log-response.dto';

import { ErrorResponseDto } from '../shared/dtos/error-response.dto';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('organizations/:organizationId/audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  /**
   * List all audit logs (non-deleted) for an organization.
   */
  @ApiOperation({
    summary: 'List audit logs',
    description:
      'Returns all audit logs for a given organization that are not soft-deleted.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '675f3f3b5b1f4a2d1cbbbbbb',
  })
  @ApiOkResponse({ type: AuditLogResponseDto, isArray: true })
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
  async listAuditLogs(
    @Param('organizationId') organizationId: string,
  ): Promise<AuditLogResponseDto[]> {
    return this.auditLogsService.listAuditLogs(organizationId);
  }

  /**
   * Get an audit log by ID.
   */
  @ApiOperation({
    summary: 'Get audit log by ID',
    description:
      'Returns a single audit log by its ID within an organization. If not found or soft-deleted, returns 404.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '675f3f3b5b1f4a2d1cbbbbbb',
  })
  @ApiParam({
    name: 'auditLogId',
    description: 'Audit log ID (MongoDB ObjectId).',
    example: '675f3f3b5b1f4a2d1caaaaaa',
  })
  @ApiOkResponse({ type: AuditLogResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid organization id or audit log id.',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Audit log not found.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @Get(':auditLogId')
  async getAuditLogById(
    @Param('organizationId') organizationId: string,
    @Param('auditLogId') auditLogId: string,
  ): Promise<AuditLogResponseDto> {
    return this.auditLogsService.getAuditLogById(
      organizationId,
      auditLogId,
    );
  }

  /**
   * Create an audit log.
   *
   * Note:
   * - Normally used internally by the system.
   */
  @ApiOperation({
    summary: 'Create audit log',
    description: 'Creates an audit log entry inside an organization.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '675f3f3b5b1f4a2d1cbbbbbb',
  })
  @ApiCreatedResponse({ type: AuditLogResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid organization id or invalid request body.',
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
  @Post()
  async createAuditLog(
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateAuditLogDto,
  ): Promise<AuditLogResponseDto> {
    return this.auditLogsService.createAuditLog(organizationId, dto);
  }

  /**
   * Update an audit log.
   */
  @ApiOperation({
    summary: 'Update audit log',
    description:
      'Updates an audit log by ID within an organization. Only non-deleted audit logs can be updated.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '675f3f3b5b1f4a2d1cbbbbbb',
  })
  @ApiParam({
    name: 'auditLogId',
    description: 'Audit log ID (MongoDB ObjectId).',
    example: '675f3f3b5b1f4a2d1caaaaaa',
  })
  @ApiOkResponse({ type: AuditLogResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid ids or invalid request body.',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Audit log not found.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @Patch(':auditLogId')
  async updateAuditLog(
    @Param('organizationId') organizationId: string,
    @Param('auditLogId') auditLogId: string,
    @Body() dto: UpdateAuditLogDto,
  ): Promise<AuditLogResponseDto> {
    return this.auditLogsService.updateAuditLog(
      organizationId,
      auditLogId,
      dto,
    );
  }

  /**
   * Soft delete an audit log.
   */
  @ApiOperation({
    summary: 'Soft delete audit log',
    description:
      'Soft deletes an audit log by ID (sets `isDeleted=true`).',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '675f3f3b5b1f4a2d1cbbbbbb',
  })
  @ApiParam({
    name: 'auditLogId',
    description: 'Audit log ID (MongoDB ObjectId).',
    example: '675f3f3b5b1f4a2d1caaaaaa',
  })
  @ApiOkResponse({
    description: 'Audit log soft deleted.',
    schema: {
      type: 'object',
      properties: { success: { type: 'boolean', example: true } },
      required: ['success'],
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid organization id or audit log id.',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Audit log not found.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @Delete(':auditLogId')
  async softDeleteAuditLog(
    @Param('organizationId') organizationId: string,
    @Param('auditLogId') auditLogId: string,
  ): Promise<{ success: true }> {
    await this.auditLogsService.softDeleteAuditLog(
      organizationId,
      auditLogId,
    );
    return { success: true };
  }
}
