import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';

import { DATABASE_CONNECTION } from '../database/database.module';
import type { Contract, MinEquipmentRule } from '../types/database/contracts';
import type { CreateContractDto } from './dto/create-contract.dto';
import type { UpdateContractDto } from './dto/update-contract.dto';
import type {
  ContractResponseDto,
  MinEquipmentRuleResponseDto,
} from './dto/contract-response.dto';

@Injectable()
export class ContractsService {
  private readonly collectionName = 'contracts';

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: Db,
  ) {}

  private get collection() {
    return this.database.collection<Contract>(this.collectionName);
  }

  private validateOrgId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid organization id');
    }
    return new ObjectId(id);
  }

  private validateContractId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid contract id');
    }
    return new ObjectId(id);
  }

  private mapMinEquipmentRules(
    rules: MinEquipmentRule[] | undefined,
  ): MinEquipmentRuleResponseDto[] {
    if (!rules || rules.length === 0) {
      return [];
    }

    return rules.map((rule) => ({
      postId: rule.postId ? rule.postId.toHexString() : null,
      equipmentTypeId: rule.equipmentTypeId.toHexString(),
      quantityMin: rule.quantityMin,
    }));
  }

  private mapToResponse(contract: Contract): ContractResponseDto {
    return {
      id: contract._id.toHexString(),
      organizationId: contract.organizationId.toHexString(),
      clientId: contract.clientId.toHexString(),
      code: contract.code,
      description: contract.description,
      startDate: contract.startDate,
      endDate: contract.endDate,
      status: contract.status,
      minEquipmentRules: this.mapMinEquipmentRules(contract.minEquipmentRules),
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
      isDeleted: contract.isDeleted,
    };
  }

  async listContracts(
    organizationId: string,
  ): Promise<ContractResponseDto[]> {
    const orgId = this.validateOrgId(organizationId);

    const contracts = await this.collection
      .find({
        organizationId: orgId,
        isDeleted: false,
      })
      .sort({ createdAt: -1 })
      .toArray();

    return contracts.map((contract) => this.mapToResponse(contract));
  }

  async getContractById(
    organizationId: string,
    contractId: string,
  ): Promise<ContractResponseDto> {
    const orgId = this.validateOrgId(organizationId);
    const id = this.validateContractId(contractId);

    const contract = await this.collection.findOne({
      _id: id,
      organizationId: orgId,
      isDeleted: false,
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    return this.mapToResponse(contract);
  }

  async createContract(
    organizationId: string,
    dto: CreateContractDto,
  ): Promise<ContractResponseDto> {
    const orgId = this.validateOrgId(organizationId);

    // code único por organização
    const existing = await this.collection.findOne({
      organizationId: orgId,
      code: dto.code,
      isDeleted: false,
    });

    if (existing) {
      throw new ConflictException(
        `Contract with code "${dto.code}" already exists in this organization`,
      );
    }

    const now = new Date();

    const clientObjectId = new ObjectId(dto.clientId);
    const startDate = new Date(dto.startDate);
    const endDate = dto.endDate ? new Date(dto.endDate) : null;
    const status = dto.status ?? 'draft';

    const minEquipmentRules: MinEquipmentRule[] =
      dto.minEquipmentRules?.map((rule) => ({
        postId: rule.postId ? new ObjectId(rule.postId) : null,
        equipmentTypeId: new ObjectId(rule.equipmentTypeId),
        quantityMin: rule.quantityMin,
      })) ?? [];

    const data: Omit<Contract, '_id'> = {
      organizationId: orgId,
      clientId: clientObjectId,
      code: dto.code,
      description: dto.description,
      startDate,
      endDate,
      status,
      minEquipmentRules,
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
    };

    const result = await this.collection.insertOne(data as Contract);

    return this.mapToResponse({
      _id: result.insertedId,
      ...data,
    });
  }

  async updateContract(
    organizationId: string,
    contractId: string,
    dto: UpdateContractDto,
  ): Promise<ContractResponseDto> {
    const orgId = this.validateOrgId(organizationId);
    const id = this.validateContractId(contractId);

    if (dto.code) {
      const existing = await this.collection.findOne({
        organizationId: orgId,
        code: dto.code,
        _id: { $ne: id },
        isDeleted: false,
      });

      if (existing) {
        throw new ConflictException(
          `Contract with code "${dto.code}" already exists in this organization`,
        );
      }
    }

    const now = new Date();

    const updatePayload: Partial<Contract> = {
      updatedAt: now,
    };

    if (dto.clientId) {
      updatePayload.clientId = new ObjectId(dto.clientId);
    }

    if (dto.code) {
      updatePayload.code = dto.code;
    }

    if (dto.description) {
      updatePayload.description = dto.description;
    }

    if (dto.startDate) {
      updatePayload.startDate = new Date(dto.startDate);
    }

    if (dto.endDate !== undefined) {
      updatePayload.endDate = dto.endDate ? new Date(dto.endDate) : null;
    }

    if (dto.status) {
      updatePayload.status = dto.status;
    }

    if (dto.minEquipmentRules) {
      updatePayload.minEquipmentRules = dto.minEquipmentRules.map((rule) => ({
        postId: rule.postId ? new ObjectId(rule.postId) : null,
        equipmentTypeId: rule.equipmentTypeId
          ? new ObjectId(rule.equipmentTypeId)
          : undefined as any, // caso venha parcial, mas normalmente virá completo
        quantityMin:
          rule.quantityMin !== undefined ? rule.quantityMin : (undefined as any),
      })) as MinEquipmentRule[];
    }

    const result = await this.collection.findOneAndUpdate(
      {
        _id: id,
        organizationId: orgId,
        isDeleted: false,
      },
      {
        $set: updatePayload,
      },
      { returnDocument: 'after' },
    );

    if (!result) {
      throw new NotFoundException('Contract not found');
    }

    return this.mapToResponse(result);
  }

  async softDeleteContract(
    organizationId: string,
    contractId: string,
  ): Promise<void> {
    const orgId = this.validateOrgId(organizationId);
    const id = this.validateContractId(contractId);
    const now = new Date();

    const result = await this.collection.findOneAndUpdate(
      {
        _id: id,
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
      throw new NotFoundException('Contract not found');
    }
  }
}
