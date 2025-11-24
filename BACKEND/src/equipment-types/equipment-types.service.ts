import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';

import { DATABASE_CONNECTION } from '../database/database.module';
import type { EquipmentType } from '../types/database/equipmentTypes';
import type { CreateEquipmentTypeDto } from './dto/create-equipment-type.dto';
import type { UpdateEquipmentTypeDto } from './dto/update-equipment-type.dto';
import type { EquipmentTypeResponseDto } from './dto/equipment-type-response.dto';

@Injectable()
export class EquipmentTypesService {
  private readonly collectionName = 'equipmentTypes';

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: Db,
  ) {}

  private get collection() {
    return this.database.collection<EquipmentType>(this.collectionName);
  }

  private validateOrganizationId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid organization id');
    }
    return new ObjectId(id);
  }

  private validateEquipmentTypeId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid equipment type id');
    }
    return new ObjectId(id);
  }

  private mapToResponse(
    equipmentType: EquipmentType,
  ): EquipmentTypeResponseDto {
    return {
      id: equipmentType._id.toHexString(),
      organizationId: equipmentType.organizationId.toHexString(),
      name: equipmentType.name,
      category: equipmentType.category,
      description: equipmentType.description,
      status: equipmentType.status,
      createdAt: equipmentType.createdAt,
      updatedAt: equipmentType.updatedAt,
      isDeleted: equipmentType.isDeleted,
    };
  }

  async listEquipmentTypes(
    organizationId: string,
  ): Promise<EquipmentTypeResponseDto[]> {
    const organizationObjectId = this.validateOrganizationId(organizationId);

    const equipmentTypes = await this.collection
      .find({
        organizationId: organizationObjectId,
        isDeleted: false,
      })
      .sort({ createdAt: -1 })
      .toArray();

    return equipmentTypes.map((equipmentType) =>
      this.mapToResponse(equipmentType),
    );
  }

  async getEquipmentTypeById(
    organizationId: string,
    equipmentTypeId: string,
  ): Promise<EquipmentTypeResponseDto> {
    const organizationObjectId = this.validateOrganizationId(organizationId);
    const equipmentTypeObjectId =
      this.validateEquipmentTypeId(equipmentTypeId);

    const equipmentType = await this.collection.findOne({
      _id: equipmentTypeObjectId,
      organizationId: organizationObjectId,
      isDeleted: false,
    });

    if (!equipmentType) {
      throw new NotFoundException('Equipment type not found');
    }

    return this.mapToResponse(equipmentType);
  }

  async createEquipmentType(
    organizationId: string,
    dto: CreateEquipmentTypeDto,
  ): Promise<EquipmentTypeResponseDto> {
    const organizationObjectId = this.validateOrganizationId(organizationId);

    const existing = await this.collection.findOne({
      organizationId: organizationObjectId,
      name: dto.name,
      category: dto.category,
      isDeleted: false,
    });

    if (existing) {
      throw new ConflictException(
        `Equipment type "${dto.name}" in category "${dto.category}" already exists in this organization`,
      );
    }

    const now = new Date();

    const data: Omit<EquipmentType, '_id'> = {
      organizationId: organizationObjectId,
      name: dto.name,
      category: dto.category,
      description: dto.description,
      status: dto.status ?? 'active',
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
    };

    const result = await this.collection.insertOne(data as EquipmentType);

    return this.mapToResponse({
      _id: result.insertedId,
      ...data,
    });
  }

  async updateEquipmentType(
    organizationId: string,
    equipmentTypeId: string,
    dto: UpdateEquipmentTypeDto,
  ): Promise<EquipmentTypeResponseDto> {
    const organizationObjectId = this.validateOrganizationId(organizationId);
    const equipmentTypeObjectId =
      this.validateEquipmentTypeId(equipmentTypeId);

    const nameToCheck = dto.name;
    const categoryToCheck = dto.category;

    if (nameToCheck || categoryToCheck) {
      const existing = await this.collection.findOne({
        organizationId: organizationObjectId,
        isDeleted: false,
        _id: { $ne: equipmentTypeObjectId },
        ...(nameToCheck && { name: nameToCheck }),
        ...(categoryToCheck && { category: categoryToCheck }),
      });

      if (existing) {
        throw new ConflictException(
          'Another equipment type with the same name/category already exists in this organization',
        );
      }
    }

    const now = new Date();

    const updatePayload: Partial<EquipmentType> = {
      updatedAt: now,
    };

    if (dto.name !== undefined) {
      updatePayload.name = dto.name;
    }

    if (dto.category !== undefined) {
      updatePayload.category = dto.category;
    }

    if (dto.description !== undefined) {
      updatePayload.description = dto.description;
    }

    if (dto.status !== undefined) {
      updatePayload.status = dto.status;
    }

    const result = await this.collection.findOneAndUpdate(
      {
        _id: equipmentTypeObjectId,
        organizationId: organizationObjectId,
        isDeleted: false,
      },
      {
        $set: updatePayload,
      },
      { returnDocument: 'after' },
    );

    if (!result) {
      throw new NotFoundException('Equipment type not found');
    }

    return this.mapToResponse(result);
  }

  async softDeleteEquipmentType(
    organizationId: string,
    equipmentTypeId: string,
  ): Promise<void> {
    const organizationObjectId = this.validateOrganizationId(organizationId);
    const equipmentTypeObjectId =
      this.validateEquipmentTypeId(equipmentTypeId);
    const now = new Date();

    const result = await this.collection.findOneAndUpdate(
      {
        _id: equipmentTypeObjectId,
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
      throw new NotFoundException('Equipment type not found');
    }
  }
}
