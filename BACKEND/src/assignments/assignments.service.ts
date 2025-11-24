import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';

import { DATABASE_CONNECTION } from '../database/database.module';
import type { Assignment, AssignmentAction } from '../types/database/assignments';
import type {
  Equipment,
  EquipmentCurrentLocation,
  EquipmentLocationType,
  EquipmentStatus,
} from '../types/database/equipments';
import type { CreateAssignmentDto } from './dto/create-assignment.dto';
import type { UpdateAssignmentDto } from './dto/update-assignment.dto';
import type {
  AssignmentLocationResponseDto,
  AssignmentResponseDto,
} from './dto/assignment-response.dto';

@Injectable()
export class AssignmentsService {
  private readonly collectionName = 'assignments';
  private readonly equipmentsCollectionName = 'equipments';

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: Db,
  ) {}

  private get assignmentsCollection() {
    return this.database.collection<Assignment>(this.collectionName);
  }

  private get equipmentsCollection() {
    return this.database.collection<Equipment>(this.equipmentsCollectionName);
  }

  private validateOrganizationId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid organization id');
    }
    return new ObjectId(id);
  }

  private validateAssignmentId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid assignment id');
    }
    return new ObjectId(id);
  }

  private validateEquipmentId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid equipment id');
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
    location: EquipmentCurrentLocation,
  ): AssignmentLocationResponseDto {
    return {
      type: location.type,
      refId: location.refId ? location.refId.toHexString() : null,
    };
  }

  private mapToResponse(assignment: Assignment): AssignmentResponseDto {
    return {
      id: assignment._id.toHexString(),
      organizationId: assignment.organizationId.toHexString(),
      equipmentId: assignment.equipmentId.toHexString(),
      fromLocation: this.mapLocationToResponse(assignment.fromLocation),
      toLocation: this.mapLocationToResponse(assignment.toLocation),
      action: assignment.action,
      effectiveAt: assignment.effectiveAt,
      notes: assignment.notes ?? null,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,
      isDeleted: assignment.isDeleted,
    };
  }

  private computeNewEquipmentStatus(
    action: AssignmentAction,
    currentStatus: EquipmentStatus,
  ): EquipmentStatus {
    if (action === 'checkout') return 'inuse';
    if (action === 'checkin') return 'available';
    return currentStatus; // transfer
  }

  private buildLocation(
    type: EquipmentLocationType,
    refId?: string,
  ): EquipmentCurrentLocation {
    return {
      type,
      refId: refId ? this.validateRefId(refId) : null,
    };
  }

  async listAssignments(
    organizationId: string,
  ): Promise<AssignmentResponseDto[]> {
    const orgId = this.validateOrganizationId(organizationId);

    const assignments = await this.assignmentsCollection
      .find({
        organizationId: orgId,
        isDeleted: false,
      })
      .sort({ effectiveAt: -1, createdAt: -1 })
      .toArray();

    return assignments.map((assignment) => this.mapToResponse(assignment));
  }

  async getAssignmentById(
    organizationId: string,
    assignmentId: string,
  ): Promise<AssignmentResponseDto> {
    const orgId = this.validateOrganizationId(organizationId);
    const assignmentObjectId = this.validateAssignmentId(assignmentId);

    const assignment = await this.assignmentsCollection.findOne({
      _id: assignmentObjectId,
      organizationId: orgId,
      isDeleted: false,
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    return this.mapToResponse(assignment);
  }

  async createAssignment(
    organizationId: string,
    dto: CreateAssignmentDto,
    performingUserId?: string,
  ): Promise<AssignmentResponseDto> {
    const orgId = this.validateOrganizationId(organizationId);
    const equipmentId = this.validateEquipmentId(dto.equipmentId);

    const equipment = await this.equipmentsCollection.findOne({
      _id: equipmentId,
      organizationId: orgId,
      isDeleted: false,
    });

    if (!equipment) {
      throw new NotFoundException('Equipment not found for this organization');
    }

    const fromLocation: EquipmentCurrentLocation =
      equipment.currentLocation ?? {
        type: 'stock',
        refId: null,
      };

    const toLocation: EquipmentCurrentLocation = this.buildLocation(
      dto.toLocation.type,
      dto.toLocation.refId,
    );

    const now = new Date();
    const effectiveAt = dto.effectiveAt ? new Date(dto.effectiveAt) : now;

    const newStatus = this.computeNewEquipmentStatus(
      dto.action,
      equipment.status,
    );

    const assignmentToInsert: Omit<Assignment, '_id'> = {
      organizationId: orgId,
      equipmentId,
      fromLocation,
      toLocation,
      action: dto.action,
      effectiveAt,
      notes: dto.notes ?? null,
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
    };

    const insertResult = await this.assignmentsCollection.insertOne(
      assignmentToInsert as Assignment,
    );

    await this.equipmentsCollection.updateOne(
      {
        _id: equipmentId,
        organizationId: orgId,
        isDeleted: false,
      },
      {
        $set: {
          currentLocation: toLocation,
          status: newStatus,
          updatedAt: now,
        },
      },
    );

    const assignment: Assignment = {
      _id: insertResult.insertedId,
      ...assignmentToInsert,
    };

    return this.mapToResponse(assignment);
  }

  async updateAssignment(
    organizationId: string,
    assignmentId: string,
    dto: UpdateAssignmentDto,
  ): Promise<AssignmentResponseDto> {
    const orgId = this.validateOrganizationId(organizationId);
    const assignmentObjectId = this.validateAssignmentId(assignmentId);

    const existing = await this.assignmentsCollection.findOne({
      _id: assignmentObjectId,
      organizationId: orgId,
      isDeleted: false,
    });

    if (!existing) {
      throw new NotFoundException('Assignment not found');
    }

    const updatePayload: Partial<Assignment> = {
      updatedAt: new Date(),
    };

    if (dto.effectiveAt !== undefined) {
      updatePayload.effectiveAt = dto.effectiveAt
        ? new Date(dto.effectiveAt)
        : existing.effectiveAt;
    }

    if (dto.notes !== undefined) {
      updatePayload.notes = dto.notes ?? null;
    }

    const result = await this.assignmentsCollection.findOneAndUpdate(
      {
        _id: assignmentObjectId,
        organizationId: orgId,
        isDeleted: false,
      },
      { $set: updatePayload },
      { returnDocument: 'after' },
    );

    if (!result) {
      throw new NotFoundException('Assignment not found');
    }

    return this.mapToResponse(result);
  }

  async softDeleteAssignment(
    organizationId: string,
    assignmentId: string,
  ): Promise<void> {
    const orgId = this.validateOrganizationId(organizationId);
    const assignmentObjectId = this.validateAssignmentId(assignmentId);
    const now = new Date();

    const result = await this.assignmentsCollection.findOneAndUpdate(
      {
        _id: assignmentObjectId,
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
      throw new NotFoundException('Assignment not found');
    }
  }
}
