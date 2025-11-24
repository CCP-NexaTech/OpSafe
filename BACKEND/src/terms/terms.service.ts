import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';

import { DATABASE_CONNECTION } from '../database/database.module';
import type { Term, TermStatus } from '../types/database/terms';
import type { CreateTermDto } from './dto/create-term.dto';
import type { UpdateTermDto } from './dto/update-term.dto';
import type { TermResponseDto } from './dto/term-response.dto';

@Injectable()
export class TermsService {
  private readonly collectionName = 'terms';

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: Db,
  ) {}

  private get collection() {
    return this.database.collection<Term>(this.collectionName);
  }

  private validateOrganizationId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid organization id');
    }
    return new ObjectId(id);
  }

  private validateTermId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid term id');
    }
    return new ObjectId(id);
  }

  private mapToResponse(term: Term): TermResponseDto {
    return {
      id: term._id.toHexString(),
      organizationId: term.organizationId.toHexString(),
      code: term.code,
      title: term.title,
      description: term.description ?? null,
      content: term.content,
      version: term.version,
      status: term.status,
      createdAt: term.createdAt,
      updatedAt: term.updatedAt,
      isDeleted: term.isDeleted,
    };
  }

  async listTerms(organizationId: string): Promise<TermResponseDto[]> {
    const orgId = this.validateOrganizationId(organizationId);

    const terms = await this.collection
      .find({
        organizationId: orgId,
        isDeleted: false,
      })
      .sort({ createdAt: -1 })
      .toArray();

    return terms.map((term) => this.mapToResponse(term));
  }

  async getTermById(
    organizationId: string,
    termId: string,
  ): Promise<TermResponseDto> {
    const orgId = this.validateOrganizationId(organizationId);
    const termObjectId = this.validateTermId(termId);

    const term = await this.collection.findOne({
      _id: termObjectId,
      organizationId: orgId,
      isDeleted: false,
    });

    if (!term) {
      throw new NotFoundException('Term not found');
    }

    return this.mapToResponse(term);
  }

  private async ensureCodeVersionUnique(
    organizationId: ObjectId,
    code: string,
    version: string,
    ignoreId?: ObjectId,
  ): Promise<void> {
    const filter: any = {
      organizationId,
      code,
      version,
      isDeleted: false,
    };

    if (ignoreId) {
      filter._id = { $ne: ignoreId };
    }

    const existing = await this.collection.findOne(filter);

    if (existing) {
      throw new ConflictException(
        `Term with code "${code}" and version "${version}" already exists in this organization`,
      );
    }
  }

  async createTerm(
    organizationId: string,
    dto: CreateTermDto,
  ): Promise<TermResponseDto> {
    const orgId = this.validateOrganizationId(organizationId);
    const now = new Date();

    const version = dto.version ?? '1.0';
    const status: TermStatus = dto.status ?? 'active';

    await this.ensureCodeVersionUnique(orgId, dto.code, version);

    const termToInsert: Omit<Term, '_id'> = {
      organizationId: orgId,
      code: dto.code,
      title: dto.title,
      description: dto.description ?? null,
      content: dto.content,
      version,
      status,
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
    };

    const result = await this.collection.insertOne(termToInsert as Term);

    const term: Term = {
      _id: result.insertedId,
      ...termToInsert,
    };

    return this.mapToResponse(term);
  }

  async updateTerm(
    organizationId: string,
    termId: string,
    dto: UpdateTermDto,
  ): Promise<TermResponseDto> {
    const orgId = this.validateOrganizationId(organizationId);
    const termObjectId = this.validateTermId(termId);

    const current = await this.collection.findOne({
      _id: termObjectId,
      organizationId: orgId,
    });

    if (!current || current.isDeleted) {
      throw new NotFoundException('Term not found');
    }

    const newCode = dto.code ?? current.code;
    const newVersion = dto.version ?? current.version;

    if (dto.code !== undefined || dto.version !== undefined) {
      await this.ensureCodeVersionUnique(orgId, newCode, newVersion, termObjectId);
    }

    const updatePayload: Partial<Term> = {
      updatedAt: new Date(),
    };

    if (dto.code !== undefined) {
      updatePayload.code = dto.code;
    }

    if (dto.title !== undefined) {
      updatePayload.title = dto.title;
    }

    if (dto.description !== undefined) {
      updatePayload.description = dto.description ?? null;
    }

    if (dto.content !== undefined) {
      updatePayload.content = dto.content;
    }

    if (dto.version !== undefined) {
      updatePayload.version = dto.version;
    }

    if (dto.status !== undefined) {
      updatePayload.status = dto.status;
    }

    const result = await this.collection.findOneAndUpdate(
      {
        _id: termObjectId,
        organizationId: orgId,
        isDeleted: false,
      },
      { $set: updatePayload },
      { returnDocument: 'after' },
    );

    if (!result) {
      throw new NotFoundException('Term not found');
    }

    return this.mapToResponse(result);
  }

  async softDeleteTerm(
    organizationId: string,
    termId: string,
  ): Promise<void> {
    const orgId = this.validateOrganizationId(organizationId);
    const termObjectId = this.validateTermId(termId);
    const now = new Date();

    const result = await this.collection.findOneAndUpdate(
      {
        _id: termObjectId,
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
      throw new NotFoundException('Term not found');
    }
  }
}
