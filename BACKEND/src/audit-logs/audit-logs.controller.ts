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
import { AuditLogsService } from './audit-logs.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { UpdateAuditLogDto } from './dto/update-audit-log.dto';
import type { AuditLogResponseDto } from './dto/audit-log-response.dto';

@Controller()
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/organizations/:organizationId/audit-logs')
  async listAuditLogs(
    @Param('organizationId') organizationId: string,
  ): Promise<AuditLogResponseDto[]> {
    return this.auditLogsService.listAuditLogs(organizationId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/organizations/:organizationId/audit-logs/:auditLogId')
  async getAuditLogById(
    @Param('organizationId') organizationId: string,
    @Param('auditLogId') auditLogId: string,
  ): Promise<AuditLogResponseDto> {
    return this.auditLogsService.getAuditLogById(
      organizationId,
      auditLogId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('/organizations/:organizationId/audit-logs')
  async createAuditLog(
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateAuditLogDto,
  ): Promise<AuditLogResponseDto> {
    return this.auditLogsService.createAuditLog(organizationId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/organizations/:organizationId/audit-logs/:auditLogId')
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

  @UseGuards(JwtAuthGuard)
  @Delete('/organizations/:organizationId/audit-logs/:auditLogId')
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
