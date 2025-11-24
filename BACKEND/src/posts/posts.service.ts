import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';

import { DATABASE_CONNECTION } from '../database/database.module';
import type { Post, PostStatus } from '../types/database/posts';
import type { CreatePostDto } from './dto/create-post.dto';
import type { UpdatePostDto } from './dto/update-post.dto';
import type { PostResponseDto } from './dto/post-response.dto';

@Injectable()
export class PostsService {
  private readonly collectionName = 'posts';

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: Db,
  ) {}

  private get collection() {
    return this.database.collection<Post>(this.collectionName);
  }

  private validateOrganizationId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid organization id');
    }
    return new ObjectId(id);
  }

  private validatePostId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid post id');
    }
    return new ObjectId(id);
  }

  private validateClientId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid client id');
    }
    return new ObjectId(id);
  }

  private validateContractId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid contract id');
    }
    return new ObjectId(id);
  }

  private mapToResponse(post: Post): PostResponseDto {
    return {
      id: post._id.toHexString(),
      organizationId: post.organizationId.toHexString(),
      clientId: post.clientId.toHexString(),
      name: post.name,
      location: post.location ?? null,
      contractId: post.contractId ? post.contractId.toHexString() : null,
      status: post.status,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      isDeleted: post.isDeleted,
    };
  }

  async listPosts(organizationId: string): Promise<PostResponseDto[]> {
    const organizationObjectId = this.validateOrganizationId(organizationId);

    const posts = await this.collection
      .find({
        organizationId: organizationObjectId,
        isDeleted: false,
      })
      .sort({ createdAt: -1 })
      .toArray();

    return posts.map((post) => this.mapToResponse(post));
  }

  async getPostById(
    organizationId: string,
    postId: string,
  ): Promise<PostResponseDto> {
    const organizationObjectId = this.validateOrganizationId(organizationId);
    const postObjectId = this.validatePostId(postId);

    const post = await this.collection.findOne({
      _id: postObjectId,
      organizationId: organizationObjectId,
      isDeleted: false,
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return this.mapToResponse(post);
  }

  async createPost(
    organizationId: string,
    dto: CreatePostDto,
  ): Promise<PostResponseDto> {
    const organizationObjectId = this.validateOrganizationId(organizationId);
    const clientObjectId = this.validateClientId(dto.clientId);

    let contractObjectId: ObjectId | null = null;
    if (dto.contractId) {
      contractObjectId = this.validateContractId(dto.contractId);
    }

    const existing = await this.collection.findOne({
      organizationId: organizationObjectId,
      clientId: clientObjectId,
      name: dto.name,
      isDeleted: false,
    });

    if (existing) {
      throw new ConflictException(
        `Post "${dto.name}" already exists for this client in this organization`,
      );
    }

    const now = new Date();

    const status: PostStatus = dto.status ?? 'active';

    const data: Omit<Post, '_id'> = {
      organizationId: organizationObjectId,
      clientId: clientObjectId,
      name: dto.name,
      location: dto.location ?? null,
      contractId: contractObjectId,
      status,
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
    };

    const result = await this.collection.insertOne(data as Post);

    return this.mapToResponse({
      _id: result.insertedId,
      ...data,
    });
  }

  async updatePost(
    organizationId: string,
    postId: string,
    dto: UpdatePostDto,
  ): Promise<PostResponseDto> {
    const organizationObjectId = this.validateOrganizationId(organizationId);
    const postObjectId = this.validatePostId(postId);

    const updatePayload: Partial<Post> = {
      updatedAt: new Date(),
    };

    if (dto.clientId) {
      updatePayload.clientId = this.validateClientId(dto.clientId);
    }

    if (dto.name !== undefined) {
      updatePayload.name = dto.name;
    }

    if (dto.location !== undefined) {
      updatePayload.location = dto.location ?? null;
    }

    if (dto.contractId !== undefined) {
      updatePayload.contractId = dto.contractId
        ? this.validateContractId(dto.contractId)
        : null;
    }

    if (dto.status !== undefined) {
      updatePayload.status = dto.status;
    }

    if (dto.name || dto.clientId) {
      const clientIdForCheck =
        dto.clientId != null
          ? this.validateClientId(dto.clientId)
          : undefined;

      const postCurrent = await this.collection.findOne({
        _id: postObjectId,
        organizationId: organizationObjectId,
      });

      if (!postCurrent || postCurrent.isDeleted) {
        throw new NotFoundException('Post not found');
      }

      const nameToCheck = dto.name ?? postCurrent.name;
      const clientToCheck = clientIdForCheck ?? postCurrent.clientId;

      const existing = await this.collection.findOne({
        organizationId: organizationObjectId,
        clientId: clientToCheck,
        name: nameToCheck,
        isDeleted: false,
        _id: { $ne: postObjectId },
      });

      if (existing) {
        throw new ConflictException(
          `Post "${nameToCheck}" already exists for this client in this organization`,
        );
      }
    }

    const result = await this.collection.findOneAndUpdate(
      {
        _id: postObjectId,
        organizationId: organizationObjectId,
        isDeleted: false,
      },
      {
        $set: updatePayload,
      },
      { returnDocument: 'after' },
    );

    if (!result) {
      throw new NotFoundException('Post not found');
    }

    return this.mapToResponse(result);
  }

  async softDeletePost(
    organizationId: string,
    postId: string,
  ): Promise<void> {
    const organizationObjectId = this.validateOrganizationId(organizationId);
    const postObjectId = this.validatePostId(postId);
    const now = new Date();

    const result = await this.collection.findOneAndUpdate(
      {
        _id: postObjectId,
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
      throw new NotFoundException('Post not found');
    }
  }
}
