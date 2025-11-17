import { Inject, Injectable } from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';
import { DATABASE_CONNECTION } from '../database/database.module';
import type { Organization } from '../types/database/organizations';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationResponseDto } from './dto/organization-response.dto';

@Injectable()
export class OrganizationsService {
  private readonly collectionName = 'organizations';

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: Db,
  ) {}

  private get collection() {
    return this.database.collection<Organization>(this.collectionName);
  }

  private mapToResponse(
    organizationDocument: Organization,
  ): OrganizationResponseDto {
    return {
      id: organizationDocument._id.toHexString(),
      name: organizationDocument.name,
      document: (organizationDocument as any).document,
      status: organizationDocument.status,
      createdAt: organizationDocument.createdAt,
      updatedAt: organizationDocument.updatedAt,
      isDeleted: organizationDocument.isDeleted,
    };
  }

  async findAll(): Promise<OrganizationResponseDto[]> {
    const organizationDocuments = await this.collection
      .find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .toArray();

    return organizationDocuments.map((organizationDocument) =>
      this.mapToResponse(organizationDocument),
    );
  }

  async findById(id: string): Promise<OrganizationResponseDto | null> {
    if (!ObjectId.isValid(id)) {
      return null;
    }

    const organizationDocument = await this.collection.findOne({
      _id: new ObjectId(id),
      isDeleted: false,
    });

    if (!organizationDocument) {
      return null;
    }

    return this.mapToResponse(organizationDocument);
  }

  async create(
    createOrganizationDto: CreateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    const now = new Date();

    const organizationToInsert: Omit<Organization, '_id'> = {
      name: createOrganizationDto.name,
      status: createOrganizationDto.status ?? 'active',
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
      ...(createOrganizationDto.document
        ? { document: createOrganizationDto.document }
        : {}),
    } as Omit<Organization, '_id'>;

    const insertResult = await this.collection.insertOne(
      organizationToInsert as Organization,
    );

    const organizationDocument: Organization = {
      _id: insertResult.insertedId,
      ...organizationToInsert,
    };

    return this.mapToResponse(organizationDocument);
  }

  async update(
    id: string,
    updateOrganizationDto: UpdateOrganizationDto,
  ): Promise<OrganizationResponseDto | null> {
    if (!ObjectId.isValid(id)) {
      return null;
    }

    const organizationId = new ObjectId(id);

    const updateDocument: Partial<Organization> = {
      ...(updateOrganizationDto.name
        ? { name: updateOrganizationDto.name }
        : {}),
      ...(updateOrganizationDto.document
        ? { document: updateOrganizationDto.document }
        : {}),
      ...(updateOrganizationDto.status
        ? { status: updateOrganizationDto.status }
        : {}),
      updatedAt: new Date(),
    };

    const result = await this.collection.findOneAndUpdate(
      {
        _id: organizationId,
        isDeleted: false,
      },
      {
        $set: updateDocument,
      },
      {
        returnDocument: 'after',
      },
    );

    if (!result) {
      return null;
    }

    return this.mapToResponse(result);
  }

  async softDelete(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) {
      return false;
    }

    const organizationId = new ObjectId(id);

    const result = await this.collection.updateOne(
      {
        _id: organizationId,
        isDeleted: false,
      },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          updatedAt: new Date(),
        } as Partial<Organization>,
      },
    );

    return result.matchedCount === 1;
  }
}
