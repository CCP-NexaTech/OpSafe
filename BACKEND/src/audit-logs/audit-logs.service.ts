import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';

import { DATABASE_CONNECTION } from '../database/database.module';
import type { AuditLog } from '../types/database/auditLogs';
import type { CreateAuditLogDto } from './dto/create-audit-log.dto';
import type { UpdateAuditLogDto } from './dto/update-audit-log.dto';
import type { AuditLogResponseDto } from './dto/audit-log-response.dto';

@Injectable()
export class AuditLogsService {
  private readonly collectionName = 'auditLogs';

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: Db,
  ) {}

  private get collection() {
    return this.database.collection<AuditLog>(this.collectionName);
  }

  private validateOrganizationId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid organization id');
    }
    return new ObjectId(id);
  }

  private validateAuditLogId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid audit log id');
    }
    return new ObjectId(id);
  }

  private toObjectIdOrNull(value?: string): ObjectId | null | undefined {
    if (value === undefined) return undefined;
    if (!value) return null;
    if (!ObjectId.isValid(value)) {
      throw new BadRequestException('Invalid entity id');
    }
    return new ObjectId(value);
  }

  private mapToResponse(log: AuditLog): AuditLogResponseDto {
    return {
      id: log._id.toHexString(),
      organizationId: log.organizationId.toHexString(),
      userId: log.userId.toHexString(),
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId?.toHexString?.() ?? null,
      ip: log.ip ?? null,
      userAgent: log.userAgent ?? null,
      metadata: log.metadata ?? null,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt,
      isDeleted: log.isDeleted,
    };
  }

  async listAuditLogs(
    organizationId: string,
  ): Promise<AuditLogResponseDto[]> {
    const orgId = this.validateOrganizationId(organizationId);

    const logs = await this.collection
      .find({
        organizationId: orgId,
        isDeleted: false,
      })
      .sort({ createdAt: -1 })
      .toArray();

    return logs.map((l) => this.mapToResponse(l));
  }

  async getAuditLogById(
    organizationId: string,
    auditLogId: string,
  ): Promise<AuditLogResponseDto> {
    const orgId = this.validateOrganizationId(organizationId);
    const logId = this.validateAuditLogId(auditLogId);

    const log = await this.collection.findOne({
      _id: logId,
      organizationId: orgId,
      isDeleted: false,
    });

    if (!log) {
      throw new NotFoundException('Audit log not found');
    }

    return this.mapToResponse(log);
  }

  async createAuditLog(
    organizationId: string,
    dto: CreateAuditLogDto,
  ): Promise<AuditLogResponseDto> {
    const orgId = this.validateOrganizationId(organizationId);

    const userId = new ObjectId(dto.userId);
    const entityId = this.toObjectIdOrNull(dto.entityId);

    const now = new Date();

    const logToInsert: Omit<AuditLog, '_id'> = {
      organizationId: orgId,
      userId,
      action: dto.action,
      entityType: dto.entityType,
      entityId: entityId ?? undefined,
      ip: dto.ip ?? null,
      userAgent: dto.userAgent ?? null,
      metadata: dto.metadata ?? null,
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
    };

    const result = await this.collection.insertOne(logToInsert as AuditLog);

    const log: AuditLog = {
      _id: result.insertedId,
      ...logToInsert,
    };

    return this.mapToResponse(log);
  }

  async updateAuditLog(
    organizationId: string,
    auditLogId: string,
    dto: UpdateAuditLogDto,
  ): Promise<AuditLogResponseDto> {
    const orgId = this.validateOrganizationId(organizationId);
    const logId = this.validateAuditLogId(auditLogId);

    const existing = await this.collection.findOne({
      _id: logId,
      organizationId: orgId,
      isDeleted: false,
    });

    if (!existing) {
      throw new NotFoundException('Audit log not found');
    }

    const updatePayload: Partial<AuditLog> = {
      updatedAt: new Date(),
    };

    if (dto.metadata !== undefined) {
      updatePayload.metadata = dto.metadata ?? null;
    }

    const result = await this.collection.findOneAndUpdate(
      {
        _id: logId,
        organizationId: orgId,
        isDeleted: false,
      },
      { $set: updatePayload },
      { returnDocument: 'after' },
    );

    if (!result) {
      throw new NotFoundException('Audit log not found');
    }

    return this.mapToResponse(result);
  }

  async softDeleteAuditLog(
    organizationId: string,
    auditLogId: string,
  ): Promise<void> {
    const orgId = this.validateOrganizationId(organizationId);
    const logId = this.validateAuditLogId(auditLogId);
    const now = new Date();

    const result = await this.collection.findOneAndUpdate(
      {
        _id: logId,
        organizationId: orgId,
        isDeleted: false,
      },
      {
        $set: {
          isDeleted: true,
          deletedAt: now,
          updatedAt: now,
        },
      },
    );

    if (!result) {
      throw new NotFoundException('Audit log not found');
    }
  }
}
