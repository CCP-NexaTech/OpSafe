import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';

import { DATABASE_CONNECTION } from '../database/database.module';
import type { Operator } from '../types/database/operators';
import type { CreateOperatorDto } from './dto/create-operator.dto';
import type { UpdateOperatorDto } from './dto/update-operator.dto';
import type { OperatorResponseDto } from './dto/operator-response.dto';

@Injectable()
export class OperatorsService {
  private readonly collectionName = 'operators';

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: Db,
  ) {}

  private get collection() {
    return this.database.collection<Operator>(this.collectionName);
  }

  private validateId(id: string) {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }
  }

  private validateOrgId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid organization id');
    }
    return new ObjectId(id);
  }

  private mapToResponse(operator: Operator): OperatorResponseDto {
    return {
      id: operator._id.toHexString(),
      organizationId: operator.organizationId.toHexString(),
      name: operator.name,
      identifierCode: operator.identifierCode,

      role: operator.role,
      phone: operator.phone,
      email: operator.email,
      postId: operator.postId?.toHexString?.(),
      shift: operator.shift,
      documentLastDigits: operator.documentLastDigits,

      status: operator.status,
      createdAt: operator.createdAt,
      updatedAt: operator.updatedAt,
      isDeleted: operator.isDeleted,
    };
  }

  async listOperators(organizationId: string): Promise<OperatorResponseDto[]> {
    const orgId = this.validateOrgId(organizationId);

    const operators = await this.collection
      .find({
        organizationId: orgId,
        isDeleted: false,
      })
      .sort({ createdAt: -1 })
      .toArray();

    return operators.map((op) => this.mapToResponse(op));
  }

  async getOperatorById(
    organizationId: string,
    operatorId: string,
  ): Promise<OperatorResponseDto> {
    this.validateId(operatorId);

    const operator = await this.collection.findOne({
      _id: new ObjectId(operatorId),
      organizationId: new ObjectId(organizationId),
      isDeleted: false,
    });

    if (!operator) {
      throw new NotFoundException('Operator not found');
    }

    return this.mapToResponse(operator);
  }

  async createOperator(
    organizationId: string,
    dto: CreateOperatorDto,
  ): Promise<OperatorResponseDto> {
    const orgId = this.validateOrgId(organizationId);

    const existing = await this.collection.findOne({
      organizationId: orgId,
      identifierCode: dto.identifierCode,
      isDeleted: false,
    });

    if (existing) {
      throw new ConflictException(
        `identifierCode "${dto.identifierCode}" already exists in this organization`,
      );
    }

    const now = new Date();

    const data: Omit<Operator, '_id'> = {
      organizationId: orgId,
      name: dto.name,
      identifierCode: dto.identifierCode,

      role: dto.role,
      phone: dto.phone,
      email: dto.email,

      postId: dto.postId ? new ObjectId(dto.postId) : undefined,
      shift: dto.shift,
      documentLastDigits: dto.documentLastDigits,

      status: 'active',
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
    };

    const result = await this.collection.insertOne(data as Operator);

    return this.mapToResponse({
      _id: result.insertedId,
      ...data,
    });
  }

  async updateOperator(
    organizationId: string,
    operatorId: string,
    dto: UpdateOperatorDto,
  ): Promise<OperatorResponseDto> {
    const orgId = this.validateOrgId(organizationId);
    this.validateId(operatorId);

    if (dto.identifierCode) {
      const exists = await this.collection.findOne({
        organizationId: orgId,
        identifierCode: dto.identifierCode,
        _id: { $ne: new ObjectId(operatorId) },
        isDeleted: false,
      });

      if (exists) {
        throw new ConflictException(
          `identifierCode "${dto.identifierCode}" already exists in this organization`,
        );
      }
    }

    const now = new Date();

    const updatePayload: any = {
      ...dto,
      updatedAt: now,
    };

    if (dto.postId) {
      updatePayload.postId = new ObjectId(dto.postId);
    }

    const result = await this.collection.findOneAndUpdate(
      {
        _id: new ObjectId(operatorId),
        organizationId: orgId,
        isDeleted: false,
      },
      { $set: updatePayload },
      { returnDocument: 'after' },
    );

    if (!result) {
      throw new NotFoundException('Operator not found');
    }

    return this.mapToResponse(result);
  }

  async softDeleteOperator(
    organizationId: string,
    operatorId: string,
  ): Promise<void> {
    const orgId = this.validateOrgId(organizationId);
    this.validateId(operatorId);

    const now = new Date();

    const result = await this.collection.findOneAndUpdate(
      {
        _id: new ObjectId(operatorId),
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
      throw new NotFoundException('Operator not found');
    }
  }
}
