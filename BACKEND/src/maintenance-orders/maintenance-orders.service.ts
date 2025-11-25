import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';

import { DATABASE_CONNECTION } from '../database/database.module';
import type {
  MaintenanceOrder,
  MaintenanceOrderStatus,
  MaintenanceOrderType,
} from '../types/database/maintenanceOrders';
import type { Equipment, EquipmentStatus } from '../types/database/equipments';
import type { CreateMaintenanceOrderDto } from './dto/create-maintenance-order.dto';
import type { UpdateMaintenanceOrderDto } from './dto/update-maintenance-order.dto';
import type { MaintenanceOrderResponseDto } from './dto/maintenance-order-response.dto';

@Injectable()
export class MaintenanceOrdersService {
  private readonly collectionName = 'maintenanceOrders';
  private readonly equipmentsCollectionName = 'equipments';

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: Db,
  ) {}

  private get collection() {
    return this.database.collection<MaintenanceOrder>(this.collectionName);
  }

  private get equipmentsCollection() {
    return this.database.collection<Equipment>(this.equipmentsCollectionName);
  }

  private validateOrganizationId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid organization id');
    }
    return new ObjectId(id);
  }

  private validateMaintenanceOrderId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid maintenance order id');
    }
    return new ObjectId(id);
  }

  private validateEquipmentId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid equipment id');
    }
    return new ObjectId(id);
  }

  private mapToResponse(order: MaintenanceOrder): MaintenanceOrderResponseDto {
    return {
      id: order._id.toHexString(),
      organizationId: order.organizationId.toHexString(),
      equipmentId: order.equipmentId.toHexString(),
      type: order.type,
      status: order.status,
      openedAt: order.openedAt,
      closedAt: order.closedAt,
      description: order.description ?? null,
      nextDueAt: order.nextDueAt ?? null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      isDeleted: order.isDeleted,
    };
  }

  private async ensureEquipmentBelongsToOrg(
    orgId: ObjectId,
    equipmentId: ObjectId,
  ): Promise<Equipment> {
    const equipment = await this.equipmentsCollection.findOne({
      _id: equipmentId,
      organizationId: orgId,
      isDeleted: false,
    });

    if (!equipment) {
      throw new NotFoundException('Equipment not found for this organization');
    }

    return equipment;
  }

  private async setEquipmentStatusOnCreate(
    equipmentId: ObjectId,
    orgId: ObjectId,
  ): Promise<void> {
    const now = new Date();

    await this.equipmentsCollection.updateOne(
      {
        _id: equipmentId,
        organizationId: orgId,
        isDeleted: false,
      },
      {
        $set: {
          status: 'inmaintenance' as EquipmentStatus,
          updatedAt: now,
        },
      },
    );
  }

  private async maybeRestoreEquipmentStatusOnStatusChange(
    equipmentId: ObjectId,
    orgId: ObjectId,
    newStatus: MaintenanceOrderStatus,
  ): Promise<void> {
    if (newStatus !== 'closed' && newStatus !== 'cancelled') {
      return;
    }

    const equipment = await this.equipmentsCollection.findOne({
      _id: equipmentId,
      organizationId: orgId,
      isDeleted: false,
    });

    if (!equipment) return;

    if (equipment.status !== 'inmaintenance') return;

    const openOrInProgress = await this.collection.countDocuments({
      organizationId: orgId,
      equipmentId,
      status: { $in: ['open', 'inprogress'] as MaintenanceOrderStatus[] },
      isDeleted: false,
    });

    if (openOrInProgress > 0) {
      return;
    }

    const now = new Date();

    await this.equipmentsCollection.updateOne(
      {
        _id: equipmentId,
        organizationId: orgId,
        isDeleted: false,
      },
      {
        $set: {
          status: 'available' as EquipmentStatus,
          updatedAt: now,
        },
      },
    );
  }

  async listMaintenanceOrders(
    organizationId: string,
  ): Promise<MaintenanceOrderResponseDto[]> {
    const orgId = this.validateOrganizationId(organizationId);

    const orders = await this.collection
      .find({
        organizationId: orgId,
        isDeleted: false,
      })
      .sort({ openedAt: -1, createdAt: -1 })
      .toArray();

    return orders.map((order) => this.mapToResponse(order));
  }

  async getMaintenanceOrderById(
    organizationId: string,
    maintenanceOrderId: string,
  ): Promise<MaintenanceOrderResponseDto> {
    const orgId = this.validateOrganizationId(organizationId);
    const orderId = this.validateMaintenanceOrderId(maintenanceOrderId);

    const order = await this.collection.findOne({
      _id: orderId,
      organizationId: orgId,
      isDeleted: false,
    });

    if (!order) {
      throw new NotFoundException('Maintenance order not found');
    }

    return this.mapToResponse(order);
  }

  async createMaintenanceOrder(
    organizationId: string,
    dto: CreateMaintenanceOrderDto,
  ): Promise<MaintenanceOrderResponseDto> {
    const orgId = this.validateOrganizationId(organizationId);
    const equipmentId = this.validateEquipmentId(dto.equipmentId);

    await this.ensureEquipmentBelongsToOrg(orgId, equipmentId);

    const now = new Date();
    const openedAt = dto.openedAt ? new Date(dto.openedAt) : now;
    const nextDueAt = dto.nextDueAt ? new Date(dto.nextDueAt) : null;

    const status: MaintenanceOrderStatus = 'open';

    const orderToInsert: Omit<MaintenanceOrder, '_id'> = {
      organizationId: orgId,
      equipmentId,
      type: dto.type,
      status,
      openedAt,
      closedAt: null,
      description: dto.description ?? null,
      nextDueAt,
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
    };

    const result = await this.collection.insertOne(
      orderToInsert as MaintenanceOrder,
    );

    await this.setEquipmentStatusOnCreate(equipmentId, orgId);

    const order: MaintenanceOrder = {
      _id: result.insertedId,
      ...orderToInsert,
    };

    return this.mapToResponse(order);
  }

  async updateMaintenanceOrder(
    organizationId: string,
    maintenanceOrderId: string,
    dto: UpdateMaintenanceOrderDto,
  ): Promise<MaintenanceOrderResponseDto> {
    const orgId = this.validateOrganizationId(organizationId);
    const orderId = this.validateMaintenanceOrderId(maintenanceOrderId);

    const existing = await this.collection.findOne({
      _id: orderId,
      organizationId: orgId,
      isDeleted: false,
    });

    if (!existing) {
      throw new NotFoundException('Maintenance order not found');
    }

    const updatePayload: Partial<MaintenanceOrder> = {
      updatedAt: new Date(),
    };

    if (dto.type !== undefined) {
      updatePayload.type = dto.type as MaintenanceOrderType;
    }

    let statusToApply: MaintenanceOrderStatus | undefined;

    if (dto.status !== undefined) {
      statusToApply = dto.status as MaintenanceOrderStatus;
      updatePayload.status = statusToApply;

      if (statusToApply === 'open' || statusToApply === 'inprogress') {
        updatePayload.closedAt = null;
      }
    }

    if (dto.description !== undefined) {
      updatePayload.description = dto.description ?? null;
    }

    if (dto.openedAt !== undefined) {
      updatePayload.openedAt = dto.openedAt
        ? new Date(dto.openedAt)
        : existing.openedAt;
    }

    if (dto.closedAt !== undefined) {
      updatePayload.closedAt = dto.closedAt ? new Date(dto.closedAt) : null;
    }

    if (dto.nextDueAt !== undefined) {
      updatePayload.nextDueAt = dto.nextDueAt ? new Date(dto.nextDueAt) : null;
    }

    const result = await this.collection.findOneAndUpdate(
      {
        _id: orderId,
        organizationId: orgId,
        isDeleted: false,
      },
      { $set: updatePayload },
      { returnDocument: 'after' },
    );

    if (!result) {
      throw new NotFoundException('Maintenance order not found');
    }

    if (statusToApply) {
      await this.maybeRestoreEquipmentStatusOnStatusChange(
        existing.equipmentId,
        orgId,
        statusToApply,
      );
    }

    return this.mapToResponse(result);
  }

  async softDeleteMaintenanceOrder(
    organizationId: string,
    maintenanceOrderId: string,
  ): Promise<void> {
    const orgId = this.validateOrganizationId(organizationId);
    const orderId = this.validateMaintenanceOrderId(maintenanceOrderId);
    const now = new Date();

    const existing = await this.collection.findOne({
      _id: orderId,
      organizationId: orgId,
      isDeleted: false,
    });

    if (!existing) {
      throw new NotFoundException('Maintenance order not found');
    }

    const result = await this.collection.findOneAndUpdate(
      {
        _id: orderId,
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
      throw new NotFoundException('Maintenance order not found');
    }

    if (existing.status === 'open' || existing.status === 'inprogress') {
      await this.maybeRestoreEquipmentStatusOnStatusChange(
        existing.equipmentId,
        orgId,
        'closed',
      );
    }
  }
}
