import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';

import { DATABASE_CONNECTION } from '../database/database.module';
import type { Alert } from '../types/database/alerts';
import type { CreateAlertDto } from './dto/create-alert.dto';
import type { UpdateAlertDto } from './dto/update-alert.dto';
import type { AlertResponseDto } from './dto/alert-response.dto';

@Injectable()
export class AlertsService {
  private readonly collectionName = 'alerts';

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: Db,
  ) {}

  private get collection() {
    return this.database.collection<Alert>(this.collectionName);
  }

  private validateOrganizationId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid organization id');
    }
    return new ObjectId(id);
  }

  private validateAlertId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid alert id');
    }
    return new ObjectId(id);
  }

  private toObjectIdOrNull(value?: string): ObjectId | null | undefined {
    if (value === undefined) return undefined;
    if (!value) return null;
    if (!ObjectId.isValid(value)) {
      throw new BadRequestException('Invalid referenced id');
    }
    return new ObjectId(value);
  }

  private mapToResponse(alert: Alert): AlertResponseDto {
    return {
      id: alert._id.toHexString(),
      organizationId: alert.organizationId.toHexString(),
      type: alert.type,
      severity: alert.severity,
      message: alert.message,
      equipmentId: alert.equipmentId?.toHexString?.() ?? null,
      operatorId: alert.operatorId?.toHexString?.() ?? null,
      contractId: alert.contractId?.toHexString?.() ?? null,
      resolvedAt: alert.resolvedAt ?? null,
      resolvedByUserId: alert.resolvedByUserId?.toHexString?.() ?? null,
      createdAt: alert.createdAt,
      updatedAt: alert.updatedAt,
      isDeleted: alert.isDeleted,
    };
  }

  async listAlerts(organizationId: string): Promise<AlertResponseDto[]> {
    const orgId = this.validateOrganizationId(organizationId);

    const alerts = await this.collection
      .find({
        organizationId: orgId,
        isDeleted: false,
      })
      .sort({ createdAt: -1 })
      .toArray();

    return alerts.map((a) => this.mapToResponse(a));
  }

  async getAlertById(
    organizationId: string,
    alertId: string,
  ): Promise<AlertResponseDto> {
    const orgId = this.validateOrganizationId(organizationId);
    const alertObjectId = this.validateAlertId(alertId);

    const alert = await this.collection.findOne({
      _id: alertObjectId,
      organizationId: orgId,
      isDeleted: false,
    });

    if (!alert) {
      throw new NotFoundException('Alert not found');
    }

    return this.mapToResponse(alert);
  }

  async createAlert(
    organizationId: string,
    dto: CreateAlertDto,
  ): Promise<AlertResponseDto> {
    const orgId = this.validateOrganizationId(organizationId);
    const now = new Date();

    const equipmentId = this.toObjectIdOrNull(dto.equipmentId);
    const operatorId = this.toObjectIdOrNull(dto.operatorId);
    const contractId = this.toObjectIdOrNull(dto.contractId);
    const resolvedByUserId = this.toObjectIdOrNull(dto.resolvedByUserId);

    const resolvedAt =
      dto.resolvedAt !== undefined && dto.resolvedAt !== null
        ? new Date(dto.resolvedAt)
        : null;

    const alertToInsert: Omit<Alert, '_id'> = {
      organizationId: orgId,
      type: dto.type,
      severity: dto.severity,
      message: dto.message,
      equipmentId: equipmentId ?? undefined,
      operatorId: operatorId ?? undefined,
      contractId: contractId ?? undefined,
      resolvedAt,
      resolvedByUserId: resolvedByUserId ?? undefined,
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
    };

    const result = await this.collection.insertOne(alertToInsert as Alert);

    const alert: Alert = {
      _id: result.insertedId,
      ...alertToInsert,
    };

    return this.mapToResponse(alert);
  }

  async updateAlert(
    organizationId: string,
    alertId: string,
    dto: UpdateAlertDto,
  ): Promise<AlertResponseDto> {
    const orgId = this.validateOrganizationId(organizationId);
    const alertObjectId = this.validateAlertId(alertId);

    const existing = await this.collection.findOne({
      _id: alertObjectId,
      organizationId: orgId,
      isDeleted: false,
    });

    if (!existing) {
      throw new NotFoundException('Alert not found');
    }

    const updatePayload: Partial<Alert> = {
      updatedAt: new Date(),
    };

    if (dto.type !== undefined) {
      updatePayload.type = dto.type;
    }

    if (dto.severity !== undefined) {
      updatePayload.severity = dto.severity;
    }

    if (dto.message !== undefined) {
      updatePayload.message = dto.message;
    }

    if (dto.equipmentId !== undefined) {
      updatePayload.equipmentId =
        this.toObjectIdOrNull(dto.equipmentId) ?? null;
    }

    if (dto.operatorId !== undefined) {
      updatePayload.operatorId = this.toObjectIdOrNull(dto.operatorId) ?? null;
    }

    if (dto.contractId !== undefined) {
      updatePayload.contractId = this.toObjectIdOrNull(dto.contractId) ?? null;
    }

    if (dto.resolvedByUserId !== undefined) {
      updatePayload.resolvedByUserId =
        this.toObjectIdOrNull(dto.resolvedByUserId) ?? null;
    }

    if (dto.resolvedAt !== undefined) {
      updatePayload.resolvedAt =
        dto.resolvedAt !== null && dto.resolvedAt !== ''
          ? new Date(dto.resolvedAt)
          : null;
    }

    const result = await this.collection.findOneAndUpdate(
      {
        _id: alertObjectId,
        organizationId: orgId,
        isDeleted: false,
      },
      { $set: updatePayload },
      { returnDocument: 'after' },
    );

    if (!result) {
      throw new NotFoundException('Alert not found');
    }

    return this.mapToResponse(result);
  }

  async softDeleteAlert(
    organizationId: string,
    alertId: string,
  ): Promise<void> {
    const orgId = this.validateOrganizationId(organizationId);
    const alertObjectId = this.validateAlertId(alertId);
    const now = new Date();

    const result = await this.collection.findOneAndUpdate(
      {
        _id: alertObjectId,
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
      throw new NotFoundException('Alert not found');
    }
  }
}
