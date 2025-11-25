import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';

import { DATABASE_CONNECTION } from '../database/database.module';
import type { CustomField } from '../types/database/customFields';
import type { CreateCustomFieldDto } from './dto/create-custom-field.dto';
import type { UpdateCustomFieldDto } from './dto/update-custom-field.dto';
import type { CustomFieldResponseDto } from './dto/custom-field-response.dto';

@Injectable()
export class CustomFieldsService {
  private readonly collectionName = 'customFields';

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: Db,
  ) {}

  private get collection() {
    return this.database.collection<CustomField>(this.collectionName);
  }

  private validateOrganizationId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid organization id');
    }
    return new ObjectId(id);
  }

  private validateCustomFieldId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid custom field id');
    }
    return new ObjectId(id);
  }

  private mapToResponse(field: CustomField): CustomFieldResponseDto {
    return {
      id: field._id.toHexString(),
      organizationId: field.organizationId.toHexString(),
      targetCollection: field.targetCollection,
      fieldKey: field.fieldKey,
      label: field.label,
      dataType: field.dataType,
      required: field.required,
      options: field.options ?? null,
      helpText: field.helpText ?? null,
      createdAt: field.createdAt,
      updatedAt: field.updatedAt,
      isDeleted: field.isDeleted,
    };
  }

  async listCustomFields(
    organizationId: string,
  ): Promise<CustomFieldResponseDto[]> {
    const orgId = this.validateOrganizationId(organizationId);

    const fields = await this.collection
      .find({
        organizationId: orgId,
        isDeleted: false,
      })
      .sort({ targetCollection: 1, label: 1 })
      .toArray();

    return fields.map((f) => this.mapToResponse(f));
  }

  async getCustomFieldById(
    organizationId: string,
    customFieldId: string,
  ): Promise<CustomFieldResponseDto> {
    const orgId = this.validateOrganizationId(organizationId);
    const fieldId = this.validateCustomFieldId(customFieldId);

    const field = await this.collection.findOne({
      _id: fieldId,
      organizationId: orgId,
      isDeleted: false,
    });

    if (!field) {
      throw new NotFoundException('Custom field not found');
    }

    return this.mapToResponse(field);
  }

  async createCustomField(
    organizationId: string,
    dto: CreateCustomFieldDto,
  ): Promise<CustomFieldResponseDto> {
    const orgId = this.validateOrganizationId(organizationId);

    const existing = await this.collection.findOne({
      organizationId: orgId,
      targetCollection: dto.targetCollection,
      fieldKey: dto.fieldKey,
      isDeleted: false,
    });

    if (existing) {
      throw new ConflictException(
        `fieldKey "${dto.fieldKey}" already exists for this collection and organization`,
      );
    }

    const now = new Date();

    const fieldToInsert: Omit<CustomField, '_id'> = {
      organizationId: orgId,
      targetCollection: dto.targetCollection,
      fieldKey: dto.fieldKey,
      label: dto.label,
      dataType: dto.dataType,
      required: dto.required,
      options: dto.options,
      helpText: dto.helpText ?? null,
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
    };

    const result = await this.collection.insertOne(
      fieldToInsert as CustomField,
    );

    const field: CustomField = {
      _id: result.insertedId,
      ...fieldToInsert,
    };

    return this.mapToResponse(field);
  }

  async updateCustomField(
    organizationId: string,
    customFieldId: string,
    dto: UpdateCustomFieldDto,
  ): Promise<CustomFieldResponseDto> {
    const orgId = this.validateOrganizationId(organizationId);
    const fieldId = this.validateCustomFieldId(customFieldId);

    const existing = await this.collection.findOne({
      _id: fieldId,
      organizationId: orgId,
      isDeleted: false,
    });

    if (!existing) {
      throw new NotFoundException('Custom field not found');
    }

    const targetCollection =
      dto.targetCollection ?? existing.targetCollection;
    const fieldKey = dto.fieldKey ?? existing.fieldKey;

    const conflict = await this.collection.findOne({
      organizationId: orgId,
      targetCollection,
      fieldKey,
      _id: { $ne: fieldId },
      isDeleted: false,
    });

    if (conflict) {
      throw new ConflictException(
        `fieldKey "${fieldKey}" already exists for this collection and organization`,
      );
    }

    const updatePayload: Partial<CustomField> = {
      updatedAt: new Date(),
    };

    if (dto.targetCollection !== undefined) {
      updatePayload.targetCollection = dto.targetCollection;
    }

    if (dto.fieldKey !== undefined) {
      updatePayload.fieldKey = dto.fieldKey;
    }

    if (dto.label !== undefined) {
      updatePayload.label = dto.label;
    }

    if (dto.dataType !== undefined) {
      updatePayload.dataType = dto.dataType;
    }

    if (dto.required !== undefined) {
      updatePayload.required = dto.required;
    }

    if (dto.options !== undefined) {
      updatePayload.options = dto.options;
    }

    if (dto.helpText !== undefined) {
      updatePayload.helpText = dto.helpText ?? null;
    }

    const result = await this.collection.findOneAndUpdate(
      {
        _id: fieldId,
        organizationId: orgId,
        isDeleted: false,
      },
      { $set: updatePayload },
      { returnDocument: 'after' },
    );

    if (!result) {
      throw new NotFoundException('Custom field not found');
    }

    return this.mapToResponse(result);
  }

  async softDeleteCustomField(
    organizationId: string,
    customFieldId: string,
  ): Promise<void> {
    const orgId = this.validateOrganizationId(organizationId);
    const fieldId = this.validateCustomFieldId(customFieldId);
    const now = new Date();

    const result = await this.collection.findOneAndUpdate(
      {
        _id: fieldId,
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
      throw new NotFoundException('Custom field not found');
    }
  }
}
