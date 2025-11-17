import { Inject, Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';
import * as argon2 from 'argon2';
import crypto from 'crypto';
import { Queue } from 'bullmq';

import { DATABASE_CONNECTION } from '../database/database.module';
import type { User, UserStatus } from '../types/database/users';
import type { InviteUserDto } from './dto/invite-user.dto';
import type { AcceptInviteDto } from './dto/accept-invite.dto';
import type { UserResponseDto } from './dto/user-response.dto';
import { USER_INVITATION_QUEUE } from '../notifications/notification.tokens';
import type { InvitationEmailJob } from '../types/notifications/invitationEmailJob';
import type { Organization } from '../types/database/organizations';


@Injectable()
export class UsersService {
  private readonly collectionName = 'users';
  private readonly organizationsCollectionName = 'organizations';

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: Db,
    @Inject(USER_INVITATION_QUEUE)
    private readonly userInvitationQueue: Queue<InvitationEmailJob>,
  ) {}

  private get usersCollection() {
    return this.database.collection<User>(this.collectionName);
  }

  private get organizationsCollection() {
    return this.database.collection(this.organizationsCollectionName);
  }

  private mapToResponse(userDocument: User): UserResponseDto {
    return {
      id: userDocument._id.toHexString(),
      organizationId: userDocument.organizationId.toHexString(),
      email: userDocument.email,
      name: userDocument.name,
      role: userDocument.role,
      status: userDocument.status,
      createdAt: userDocument.createdAt,
      updatedAt: userDocument.updatedAt,
      isDeleted: userDocument.isDeleted,
    };
  }

  private generateInvitationToken(): string {
    return Buffer.from(crypto.randomUUID()).toString('base64url');
  }

  async inviteUser(
    organizationId: string,
    inviteUserDto: InviteUserDto,
  ): Promise<UserResponseDto & { invitationToken: string }> {
    if (!ObjectId.isValid(organizationId)) {
      throw new BadRequestException('Invalid organization id');
    }

    const organizationObjectId = new ObjectId(organizationId);

    const organizationExists = await this.organizationsCollection.findOne({
      _id: organizationObjectId,
      isDeleted: false,
    });

    if (!organizationExists) {
      throw new NotFoundException('Organization not found');
    }

    const existingUser = await this.usersCollection.findOne({
      organizationId: organizationObjectId,
      email: inviteUserDto.email.toLowerCase(),
      isDeleted: false,
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists in this organization');
    }

    const now = new Date();
    const invitationToken = this.generateInvitationToken();
    const invitationExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const userStatus: UserStatus = 'pending';

    const userToInsert: Omit<User, '_id'> = {
      organizationId: organizationObjectId,
      email: inviteUserDto.email.toLowerCase(),
      name: inviteUserDto.name,
      role: inviteUserDto.role ?? 'viewer',
      status: userStatus,
      passwordHash: null,
      invitationToken,
      invitationExpiresAt,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    const insertResult = await this.usersCollection.insertOne(userToInsert as User);

    const userDocument: User = {
      _id: insertResult.insertedId,
      ...userToInsert,
    };

    const organizationName = organizationExists.name;

    await this.userInvitationQueue.add('send-invitation-email', {
      email: userDocument.email,
      name: userDocument.name,
      organizationName,
      invitationToken,
    });

    return {
      ...this.mapToResponse(userDocument),
      invitationToken,
    };
  }

  async acceptInvite(acceptInviteDto: AcceptInviteDto): Promise<UserResponseDto> {
    const now = new Date();

    const userDocument = await this.usersCollection.findOne({
      invitationToken: acceptInviteDto.token,
      isDeleted: false,
    });

    if (!userDocument) {
      throw new NotFoundException('Invitation not found or already used');
    }

    if (!userDocument.invitationExpiresAt || userDocument.invitationExpiresAt < now) {
      throw new BadRequestException('Invitation expired');
    }

    if (userDocument.status !== 'pending') {
      throw new BadRequestException('User is not in pending status');
    }

    const passwordHash = await argon2.hash(acceptInviteDto.password);

    const updatedUser: Partial<User> = {
      passwordHash,
      name: acceptInviteDto.name,
      status: 'active',
      invitationToken: null,
      invitationExpiresAt: null,
      updatedAt: now,
    };

    const result = await this.usersCollection.findOneAndUpdate(
      { _id: userDocument._id, isDeleted: false },
      { $set: updatedUser },
      { returnDocument: 'after' },
    );

    if (!result) {
      throw new NotFoundException('User not found during update');
    }

    return this.mapToResponse(result);
  }

  async listUsersByOrganization(organizationId: string): Promise<UserResponseDto[]> {
    if (!ObjectId.isValid(organizationId)) {
      throw new BadRequestException('Invalid organization id');
    }

    const organizationObjectId = new ObjectId(organizationId);

    const users = await this.usersCollection
      .find({
        organizationId: organizationObjectId,
        isDeleted: false,
      })
      .sort({ createdAt: -1 })
      .toArray();

    return users.map((userDocument) => this.mapToResponse(userDocument));
  }
}
