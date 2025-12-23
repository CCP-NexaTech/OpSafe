import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiCreatedResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationResponseDto } from './dto/organization-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import {
  ErrorResponseDto,
  ValidationErrorResponseDto,
} from '../shared/dtos/error-response.dto';

@ApiTags('Organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  /**
   * List all organizations (non-deleted).
   *
   * Auth:
   * - Requires a valid JWT (Bearer token).
   *
   * Notes:
   * - This endpoint returns an array of organizations.
   */
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List organizations',
    description: 'Returns all organizations that are not soft-deleted.',
  })
  @ApiOkResponse({ type: OrganizationResponseDto, isArray: true })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  @Get()
  async list(): Promise<OrganizationResponseDto[]> {
    return this.organizationsService.findAll();
  }

  /**
   * Get an organization by ID.
   *
   * Auth:
   * - Requires a valid JWT (Bearer token).
   *
   * Errors:
   * - 400: Invalid MongoDB ObjectId format.
   * - 404: Organization not found (or soft-deleted).
   */
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get organization by ID',
    description:
      'Returns a single organization by its ID. If the organization does not exist or is soft-deleted, returns 404.',
  })
  @ApiParam({
    name: 'id',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiOkResponse({ type: OrganizationResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid organization id.',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Organization not found.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(@Param('id') id: string): Promise<OrganizationResponseDto> {
    const organization = await this.organizationsService.findById(id);

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  /**
   * Create a new organization.
   *
   * Auth:
   * - Public endpoint (no JWT).
   *
   * Errors:
   * - 400: Validation errors (DTO validation) or malformed payload.
   */
  @ApiOperation({
    summary: 'Create organization',
    description:
      'Creates a new organization. This is a public endpoint and does not require authentication.',
  })
  @ApiCreatedResponse({ type: OrganizationResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid request body (validation failed).',
    type: ValidationErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @Post()
  async create(
    @Body() body: CreateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    return this.organizationsService.create(body);
  }

  /**
   * Update an organization.
   *
   * Auth:
   * - Requires a valid JWT (Bearer token).
   *
   * Errors:
   * - 400: Invalid MongoDB ObjectId format OR validation errors in payload.
   * - 404: Organization not found (or soft-deleted).
   */
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update organization',
    description:
      'Updates an organization by ID. Only non-deleted organizations can be updated.',
  })
  @ApiParam({
    name: 'id',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiOkResponse({ type: OrganizationResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid organization id or invalid request body.',
    type: ValidationErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Organization not found.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    const organization = await this.organizationsService.update(id, body);

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  /**
   * Soft delete an organization.
   *
   * Auth:
   * - Requires a valid JWT (Bearer token).
   *
   * Notes:
   * - This performs a soft delete (marks `isDeleted=true`) instead of removing the record.
   *
   * Errors:
   * - 400: Invalid MongoDB ObjectId format.
   * - 404: Organization not found (or already soft-deleted).
   */
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Soft delete organization',
    description:
      'Soft deletes an organization by ID (sets `isDeleted=true` and timestamps).',
  })
  @ApiParam({
    name: 'id',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiNoContentResponse({ description: 'Organization soft deleted.' })
  @ApiBadRequestResponse({
    description: 'Invalid organization id.',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Organization not found.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    const deleted = await this.organizationsService.softDelete(id);

    if (!deleted) {
      throw new NotFoundException('Organization not found');
    }
  }
}
