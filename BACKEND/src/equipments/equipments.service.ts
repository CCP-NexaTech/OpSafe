import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';

import { DATABASE_CONNECTION } from '../database/database.module';
import type {
  Equipment,
  EquipmentStatus,
  EquipmentLocationType,
} from '../types/database/equipments';
import type { CreateEquipmentDto } from './dto/create-equipment.dto';
import type { UpdateEquipmentDto } from './dto/update-equipment.dto';
import type {
  EquipmentLocationResponseDto,
  EquipmentResponseDto,
} from './dto/equipment-response.dto';

@Injectable()
export class EquipmentsService {
  private readonly collectionName = 'equipments';

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: Db,
  ) {}

  private get collection() {
    return this.database.collection<Equipment>(this.collectionName);
  }

  private validateOrganizationId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid organization id');
    }
    return new ObjectId(id);
  }

  private validateEquipmentId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid equipment id');
    }
    return new ObjectId(id);
  }

  private validateEquipmentTypeId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid equipment type id');
    }
    return new ObjectId(id);
  }

  private validateContractId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid contract id');
    }
    return new ObjectId(id);
  }

  private validateRefId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid location ref id');
    }
    return new ObjectId(id);
  }

  private mapLocationToResponse(
    location: Equipment['currentLocation'],
  ): EquipmentLocationResponseDto {
    return {
      type: location.type,
      refId: location.refId ? location.refId.toHexString() : null,
    };
  }

  private mapToResponse(equipment: Equipment): EquipmentResponseDto {
    return {
      id: equipment._id.toHexString(),
      organizationId: equipment.organizationId.toHexString(),
      equipmentTypeId: equipment.equipmentTypeId.toHexString(),
      serialNumber: equipment.serialNumber ?? null,
      assetTag: equipment.assetTag,
      status: equipment.status,
      currentLocation: this.mapLocationToResponse(equipment.currentLocation),
      purchaseDate: equipment.purchaseDate ?? null,
      warrantyExpiresAt: equipment.warrantyExpiresAt ?? null,
      validUntil: equipment.validUntil ?? null,
      contractId: equipment.contractId
        ? equipment.contractId.toHexString()
        : null,
      notes: equipment.notes ?? null,
      createdAt: equipment.createdAt,
      updatedAt: equipment.updatedAt,
      isDeleted: equipment.isDeleted,
    };
  }

  async listEquipments(
    organizationId: string,
  ): Promise<EquipmentResponseDto[]> {
    const organizationObjectId = this.validateOrganizationId(organizationId);

    const equipments = await this.collection
      .find({
        organizationId: organizationObjectId,
        isDeleted: false,
      })
      .sort({ createdAt: -1 })
      .toArray();

    return equipments.map((equipment) => this.mapToResponse(equipment));
  }

  async getEquipmentById(
    organizationId: string,
    equipmentId: string,
  ): Promise<EquipmentResponseDto> {
    const organizationObjectId = this.validateOrganizationId(organizationId);
    const equipmentObjectId = this.validateEquipmentId(equipmentId);

    const equipment = await this.collection.findOne({
      _id: equipmentObjectId,
      organizationId: organizationObjectId,
      isDeleted: false,
    });

    if (!equipment) {
      throw new NotFoundException('Equipment not found');
    }

    return this.mapToResponse(equipment);
  }

  async createEquipment(
    organizationId: string,
    dto: CreateEquipmentDto,
  ): Promise<EquipmentResponseDto> {
    const organizationObjectId = this.validateOrganizationId(organizationId);
    const equipmentTypeObjectId = this.validateEquipmentTypeId(
      dto.equipmentTypeId,
    );

    const existing = await this.collection.findOne({
      organizationId: organizationObjectId,
      assetTag: dto.assetTag,
      isDeleted: false,
    });

    if (existing) {
      throw new ConflictException(
        `Equipment with assetTag "${dto.assetTag}" already exists in this organization`,
      );
    }

    let contractObjectId: ObjectId | null = null;
    if (dto.contractId) {
      contractObjectId = this.validateContractId(dto.contractId);
    }

    let currentLocation: Equipment['currentLocation'];
    if (dto.currentLocation) {
      const type = dto.currentLocation
        .type as EquipmentLocationType;
      const refId =
        dto.currentLocation.refId != null
          ? this.validateRefId(dto.currentLocation.refId)
          : null;

      currentLocation = {
        type,
        refId,
      };
    } else {
      currentLocation = {
        type: 'stock',
        refId: null,
      };
    }

    const now = new Date();
    const status: EquipmentStatus = dto.status ?? 'available';

    const data: Omit<Equipment, '_id'> = {
      organizationId: organizationObjectId,
      equipmentTypeId: equipmentTypeObjectId,
      serialNumber: dto.serialNumber ?? null,
      assetTag: dto.assetTag,
      status,
      currentLocation,
      purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : null,
      warrantyExpiresAt: dto.warrantyExpiresAt
        ? new Date(dto.warrantyExpiresAt)
        : null,
      validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
      contractId: contractObjectId,
      notes: dto.notes ?? null,
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
    };

    const result = await this.collection.insertOne(data as Equipment);

    return this.mapToResponse({
      _id: result.insertedId,
      ...data,
    });
  }

  async updateEquipment(
    organizationId: string,
    equipmentId: string,
    dto: UpdateEquipmentDto,
  ): Promise<EquipmentResponseDto> {
    const organizationObjectId = this.validateOrganizationId(organizationId);
    const equipmentObjectId = this.validateEquipmentId(equipmentId);

    const current = await this.collection.findOne({
      _id: equipmentObjectId,
      organizationId: organizationObjectId,
    });

    if (!current || current.isDeleted) {
      throw new NotFoundException('Equipment not found');
    }

    if (dto.assetTag) {
      const exists = await this.collection.findOne({
        organizationId: organizationObjectId,
        assetTag: dto.assetTag,
        isDeleted: false,
        _id: { $ne: equipmentObjectId },
      });

      if (exists) {
        throw new ConflictException(
          `Equipment with assetTag "${dto.assetTag}" already exists in this organization`,
        );
      }
    }

    const updatePayload: Partial<Equipment> = {
      updatedAt: new Date(),
    };

    if (dto.equipmentTypeId) {
      updatePayload.equipmentTypeId = this.validateEquipmentTypeId(
        dto.equipmentTypeId,
      );
    }

    if (dto.serialNumber !== undefined) {
      updatePayload.serialNumber = dto.serialNumber ?? null;
    }

    if (dto.assetTag !== undefined) {
      updatePayload.assetTag = dto.assetTag;
    }

    if (dto.status !== undefined) {
      updatePayload.status = dto.status;
    }

    if (dto.purchaseDate !== undefined) {
      updatePayload.purchaseDate = dto.purchaseDate
        ? new Date(dto.purchaseDate)
        : null;
    }

    if (dto.warrantyExpiresAt !== undefined) {
      updatePayload.warrantyExpiresAt = dto.warrantyExpiresAt
        ? new Date(dto.warrantyExpiresAt)
        : null;
    }

    if (dto.validUntil !== undefined) {
      updatePayload.validUntil = dto.validUntil
        ? new Date(dto.validUntil)
        : null;
    }

    if (dto.contractId !== undefined) {
      updatePayload.contractId = dto.contractId
        ? this.validateContractId(dto.contractId)
        : null;
    }

    if (dto.notes !== undefined) {
      updatePayload.notes = dto.notes ?? null;
    }

    if (dto.currentLocation) {
      const type = dto.currentLocation
        .type as EquipmentLocationType;
      const refId =
        dto.currentLocation.refId != null
          ? this.validateRefId(dto.currentLocation.refId)
          : null;

      updatePayload.currentLocation = {
        type,
        refId,
      };
    }

    const result = await this.collection.findOneAndUpdate(
      {
        _id: equipmentObjectId,
        organizationId: organizationObjectId,
        isDeleted: false,
      },
      {
        $set: updatePayload,
      },
      { returnDocument: 'after' },
    );

    if (!result) {
      throw new NotFoundException('Equipment not found');
    }

    return this.mapToResponse(result);
  }

  async softDeleteEquipment(
    organizationId: string,
    equipmentId: string,
  ): Promise<void> {
    const organizationObjectId = this.validateOrganizationId(organizationId);
    const equipmentObjectId = this.validateEquipmentId(equipmentId);
    const now = new Date();

    const result = await this.collection.findOneAndUpdate(
      {
        _id: equipmentObjectId,
        organizationId: organizationObjectId,
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
      throw new NotFoundException('Equipment not found');
    }
  }
}
