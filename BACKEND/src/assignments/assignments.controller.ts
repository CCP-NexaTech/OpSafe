import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import type { AssignmentResponseDto } from './dto/assignment-response.dto';
import { Roles } from '../auth/role.decorator';

@Controller()
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/organizations/:organizationId/assignments')
  async listAssignments(
    @Param('organizationId') organizationId: string,
  ): Promise<AssignmentResponseDto[]> {
    return this.assignmentsService.listAssignments(organizationId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/organizations/:organizationId/assignments/:assignmentId')
  async getAssignmentById(
    @Param('organizationId') organizationId: string,
    @Param('assignmentId') assignmentId: string,
  ): Promise<AssignmentResponseDto> {
    return this.assignmentsService.getAssignmentById(
      organizationId,
      assignmentId,
    );
  }

  @Roles('admin', 'manager')
  @UseGuards(JwtAuthGuard)
  @Post('/organizations/:organizationId/assignments')
  async createAssignment(
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateAssignmentDto,
    @Req() req: any,
  ): Promise<AssignmentResponseDto> {
    const performingUserId = req.user?.id as string | undefined;
    return this.assignmentsService.createAssignment(
      organizationId,
      dto,
      performingUserId,
    );
  }

  @Roles('admin', 'manager')
  @UseGuards(JwtAuthGuard)
  @Patch('/organizations/:organizationId/assignments/:assignmentId')
  async updateAssignment(
    @Param('organizationId') organizationId: string,
    @Param('assignmentId') assignmentId: string,
    @Body() dto: UpdateAssignmentDto,
  ): Promise<AssignmentResponseDto> {
    return this.assignmentsService.updateAssignment(
      organizationId,
      assignmentId,
      dto,
    );
  }

  @Roles('admin', 'manager')
  @UseGuards(JwtAuthGuard)
  @Delete('/organizations/:organizationId/assignments/:assignmentId')
  async softDeleteAssignment(
    @Param('organizationId') organizationId: string,
    @Param('assignmentId') assignmentId: string,
  ): Promise<{ success: true }> {
    await this.assignmentsService.softDeleteAssignment(
      organizationId,
      assignmentId,
    );
    return { success: true };
  }
}
