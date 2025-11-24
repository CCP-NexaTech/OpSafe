import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';

import { DATABASE_CONNECTION } from '../database/database.module';
import type { Client } from '../types/database/clients';
import type { CreateClientDto } from './dto/create-client.dto';
import type { UpdateClientDto } from './dto/update-client.dto';
import type { ClientResponseDto } from './dto/client-response.dto';

@Injectable()
export class ClientsService {
  private readonly collectionName = 'clients';

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: Db,
  ) {}

  private get collection() {
    return this.database.collection<Client>(this.collectionName);
  }

  private validateOrgId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid organization id');
    }
    return new ObjectId(id);
  }

  private validateId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid client id');
    }
    return new ObjectId(id);
  }

  private mapToResponse(client: Client): ClientResponseDto {
    return {
      id: client._id.toHexString(),
      organizationId: client.organizationId.toHexString(),
      name: client.name,
      document: client.document,

      mainContactName: client.mainContactName,
      mainContactPhone: client.mainContactPhone,
      mainContactEmail: client.mainContactEmail,

      addressStreet: client.addressStreet,
      addressNumber: client.addressNumber,
      addressComplement: client.addressComplement,
      addressNeighborhood: client.addressNeighborhood,
      addressCity: client.addressCity,
      addressState: client.addressState,
      addressZipCode: client.addressZipCode,

      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
      isDeleted: client.isDeleted,
    };
  }

  async listClients(organizationId: string): Promise<ClientResponseDto[]> {
    const orgId = this.validateOrgId(organizationId);

    const clients = await this.collection
      .find({
        organizationId: orgId,
        isDeleted: false,
      })
      .sort({ createdAt: -1 })
      .toArray();

    return clients.map((client) => this.mapToResponse(client));
  }

  async getClientById(
    organizationId: string,
    clientId: string,
  ): Promise<ClientResponseDto> {
    const orgId = this.validateOrgId(organizationId);
    const id = this.validateId(clientId);

    const client = await this.collection.findOne({
      _id: id,
      organizationId: orgId,
      isDeleted: false,
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return this.mapToResponse(client);
  }

  async createClient(
    organizationId: string,
    dto: CreateClientDto,
  ): Promise<ClientResponseDto> {
    const orgId = this.validateOrgId(organizationId);

    // evitar documento duplicado na mesma organização
    const existing = await this.collection.findOne({
      organizationId: orgId,
      document: dto.document,
      isDeleted: false,
    });

    if (existing) {
      throw new ConflictException(
        `Client with document "${dto.document}" already exists in this organization`,
      );
    }

    const now = new Date();

    const data: Omit<Client, '_id'> = {
      organizationId: orgId,
      name: dto.name,
      document: dto.document,

      mainContactName: dto.mainContactName,
      mainContactPhone: dto.mainContactPhone,
      mainContactEmail: dto.mainContactEmail,

      addressStreet: dto.addressStreet,
      addressNumber: dto.addressNumber,
      addressComplement: dto.addressComplement,
      addressNeighborhood: dto.addressNeighborhood,
      addressCity: dto.addressCity,
      addressState: dto.addressState,
      addressZipCode: dto.addressZipCode,

      createdAt: now,
      updatedAt: now,
      isDeleted: false,
    };

    const result = await this.collection.insertOne(data as Client);

    return this.mapToResponse({
      _id: result.insertedId,
      ...data,
    });
  }

  async updateClient(
    organizationId: string,
    clientId: string,
    dto: UpdateClientDto,
  ): Promise<ClientResponseDto> {
    const orgId = this.validateOrgId(organizationId);
    const id = this.validateId(clientId);

    if (dto.document) {
      const existing = await this.collection.findOne({
        organizationId: orgId,
        document: dto.document,
        _id: { $ne: id },
        isDeleted: false,
      });

      if (existing) {
        throw new ConflictException(
          `Client with document "${dto.document}" already exists in this organization`,
        );
      }
    }

    const now = new Date();

    const result = await this.collection.findOneAndUpdate(
      {
        _id: id,
        organizationId: orgId,
        isDeleted: false,
      },
      {
        $set: {
          ...dto,
          updatedAt: now,
        },
      },
      { returnDocument: 'after' },
    );

    if (!result) {
      throw new NotFoundException('Client not found');
    }

    return this.mapToResponse(result);
  }

  async softDeleteClient(
    organizationId: string,
    clientId: string,
  ): Promise<void> {
    const orgId = this.validateOrgId(organizationId);
    const id = this.validateId(clientId);
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
      throw new NotFoundException('Client not found');
    }
  }
}
