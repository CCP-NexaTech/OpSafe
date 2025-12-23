import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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

import { TermsService } from './terms.service';
import { CreateTermDto } from './dto/create-term.dto';
import { UpdateTermDto } from './dto/update-term.dto';
import { TermResponseDto } from './dto/term-response.dto';

import {
  ErrorResponseDto,
  ValidationErrorResponseDto,
} from '../shared/dtos/error-response.dto';

@ApiTags('Terms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('organizations/:organizationId/terms')
export class TermsController {
  constructor(private readonly termsService: TermsService) {}

  /**
   * List all terms (non-deleted) for an organization.
   *
   * Auth:
   * - Requires a valid JWT (Bearer token).
   *
   * Errors:
   * - 400: Invalid organization id.
   */
  @ApiOperation({
    summary: 'List terms',
    description:
      'Returns all terms for a given organization that are not soft-deleted.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiOkResponse({ type: TermResponseDto, isArray: true })
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
  async listTerms(
    @Param('organizationId') organizationId: string,
  ): Promise<TermResponseDto[]> {
    return this.termsService.listTerms(organizationId);
  }

  /**
   * Get a term by ID.
   *
   * Auth:
   * - Requires a valid JWT (Bearer token).
   *
   * Errors:
   * - 400: Invalid organization id OR invalid term id.
   * - 404: Term not found (or soft-deleted).
   */
  @ApiOperation({
    summary: 'Get term by ID',
    description:
      'Returns a single term by its ID within an organization. If not found or soft-deleted, returns 404.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiParam({
    name: 'termId',
    description: 'Term ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7ab',
  })
  @ApiOkResponse({ type: TermResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid organization id or term id.',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Term not found.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @Get(':termId')
  async getTermById(
    @Param('organizationId') organizationId: string,
    @Param('termId') termId: string,
  ): Promise<TermResponseDto> {
    return this.termsService.getTermById(organizationId, termId);
  }

  /**
   * Create a term.
   *
   * Auth:
   * - Requires a valid JWT (Bearer token).
   * - Requires role: admin or manager.
   *
   * Errors:
   * - 400: Invalid organization id OR validation errors in payload.
   */
  @ApiOperation({
    summary: 'Create term',
    description: 'Creates a term inside an organization.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiCreatedResponse({ type: TermResponseDto })
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
  async createTerm(
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateTermDto,
  ): Promise<TermResponseDto> {
    return this.termsService.createTerm(organizationId, dto);
  }

  /**
   * Update a term.
   *
   * Auth:
   * - Requires a valid JWT (Bearer token).
   * - Requires role: admin or manager.
   *
   * Errors:
   * - 400: Invalid ids OR validation errors in payload.
   * - 404: Term not found (or soft-deleted).
   */
  @ApiOperation({
    summary: 'Update term',
    description:
      'Updates a term by ID within an organization. Only non-deleted terms can be updated.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiParam({
    name: 'termId',
    description: 'Term ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7ab',
  })
  @ApiOkResponse({ type: TermResponseDto })
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
    description: 'Term not found.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @Roles('admin', 'manager')
  @Patch(':termId')
  async updateTerm(
    @Param('organizationId') organizationId: string,
    @Param('termId') termId: string,
    @Body() dto: UpdateTermDto,
  ): Promise<TermResponseDto> {
    return this.termsService.updateTerm(organizationId, termId, dto);
  }

  /**
   * Soft delete a term.
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
   * - 404: Term not found (or already soft-deleted).
   */
  @ApiOperation({
    summary: 'Soft delete term',
    description:
      'Soft deletes a term by ID (sets `isDeleted=true` and timestamps).',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiParam({
    name: 'termId',
    description: 'Term ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7ab',
  })
  @ApiOkResponse({
    description: 'Term soft deleted.',
    schema: {
      type: 'object',
      properties: { success: { type: 'boolean', example: true } },
      required: ['success'],
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid organization id or term id.',
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
    description: 'Term not found.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @Roles('admin', 'manager')
  @Delete(':termId')
  async softDeleteTerm(
    @Param('organizationId') organizationId: string,
    @Param('termId') termId: string,
  ): Promise<{ success: true }> {
    await this.termsService.softDeleteTerm(organizationId, termId);
    return { success: true };
  }
}
