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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/role.decorator';

import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { AssignmentResponseDto } from './dto/assignment-response.dto';

import {
  ErrorResponseDto,
  ValidationErrorResponseDto,
} from '../shared/dtos/error-response.dto';

@ApiTags('Assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('organizations/:organizationId/assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  /**
   * List all assignments (non-deleted) for an organization.
   *
   * Auth:
   * - Requires a valid JWT (Bearer token).
   *
   * Errors:
   * - 400: Invalid organization id.
   */
  @ApiOperation({
    summary: 'List assignments',
    description:
      'Returns all assignments for a given organization that are not soft-deleted.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiOkResponse({ type: AssignmentResponseDto, isArray: true })
  @ApiBadRequestResponse({
    description: 'Invalid organization id.',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @Get()
  async listAssignments(
    @Param('organizationId') organizationId: string,
  ): Promise<AssignmentResponseDto[]> {
    return this.assignmentsService.listAssignments(organizationId);
  }

  /**
   * Get an assignment by ID.
   *
   * Auth:
   * - Requires a valid JWT (Bearer token).
   *
   * Errors:
   * - 400: Invalid organization id OR invalid assignment id.
   * - 404: Assignment not found (or soft-deleted).
   */
  @ApiOperation({
    summary: 'Get assignment by ID',
    description:
      'Returns a single assignment by its ID within an organization. If not found or soft-deleted, returns 404.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiParam({
    name: 'assignmentId',
    description: 'Assignment ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7fa',
  })
  @ApiOkResponse({ type: AssignmentResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid organization id or assignment id.',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Assignment not found.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @Get(':assignmentId')
  async getAssignmentById(
    @Param('organizationId') organizationId: string,
    @Param('assignmentId') assignmentId: string,
  ): Promise<AssignmentResponseDto> {
    return this.assignmentsService.getAssignmentById(
      organizationId,
      assignmentId,
    );
  }

  /**
   * Create an assignment.
   *
   * Auth:
   * - Requires a valid JWT (Bearer token).
   * - Requires role: admin or manager.
   *
   * Notes:
   * - The performing user is captured from the JWT (req.user.id) and passed to the service.
   *
   * Errors:
   * - 400: Invalid organization id OR validation errors in payload.
   */
  @ApiOperation({
    summary: 'Create assignment',
    description:
      'Creates an assignment inside an organization. The performing user is taken from the JWT and recorded by the service when applicable.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiCreatedResponse({ type: AssignmentResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid organization id or invalid request body.',
    type: ValidationErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT.',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions (requires admin or manager).',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @Roles('admin', 'manager')
  @Post()
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

  /**
   * Update an assignment.
   *
   * Auth:
   * - Requires a valid JWT (Bearer token).
   * - Requires role: admin or manager.
   *
   * Errors:
   * - 400: Invalid ids OR validation errors in payload.
   * - 404: Assignment not found (or soft-deleted).
   */
  @ApiOperation({
    summary: 'Update assignment',
    description:
      'Updates an assignment by ID within an organization. Only non-deleted assignments can be updated.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiParam({
    name: 'assignmentId',
    description: 'Assignment ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7fa',
  })
  @ApiOkResponse({ type: AssignmentResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid ids or invalid request body.',
    type: ValidationErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT.',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions (requires admin or manager).',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Assignment not found.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @Roles('admin', 'manager')
  @Patch(':assignmentId')
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

  /**
   * Soft delete an assignment.
   *
   * Auth:
   * - Requires a valid JWT (Bearer token).
   * - Requires role: admin or manager.
   *
   * Notes:
   * - Soft delete (sets `isDeleted=true`).
   *
   * Errors:
   * - 400: Invalid ids.
   * - 404: Assignment not found (or already soft-deleted).
   */
  @ApiOperation({
    summary: 'Soft delete assignment',
    description:
      'Soft deletes an assignment by ID (sets `isDeleted=true` and timestamps).',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiParam({
    name: 'assignmentId',
    description: 'Assignment ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7fa',
  })
  @ApiOkResponse({
    description: 'Assignment soft deleted.',
    schema: {
      type: 'object',
      properties: { success: { type: 'boolean', example: true } },
      required: ['success'],
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid organization id or assignment id.',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT.',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions (requires admin or manager).',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Assignment not found.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @Roles('admin', 'manager')
  @Delete(':assignmentId')
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
