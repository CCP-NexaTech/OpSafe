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

import { CustomFieldsService } from './custom-fields.service';
import { CreateCustomFieldDto } from './dto/create-custom-field.dto';
import { UpdateCustomFieldDto } from './dto/update-custom-field.dto';
import { CustomFieldResponseDto } from './dto/custom-field-response.dto';

import {
  ErrorResponseDto,
  ValidationErrorResponseDto,
} from '../shared/dtos/error-response.dto';

@ApiTags('Custom Fields')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('organizations/:organizationId/custom-fields')
export class CustomFieldsController {
  constructor(private readonly customFieldsService: CustomFieldsService) {}

  /**
   * List all custom fields (non-deleted) for an organization.
   */
  @ApiOperation({
    summary: 'List custom fields',
    description:
      'Returns all custom fields for a given organization that are not soft-deleted.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '675f3f3b5b1f4a2d1cbbbbbb',
  })
  @ApiOkResponse({ type: CustomFieldResponseDto, isArray: true })
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
  async listCustomFields(
    @Param('organizationId') organizationId: string,
  ): Promise<CustomFieldResponseDto[]> {
    return this.customFieldsService.listCustomFields(organizationId);
  }

  /**
   * Get a custom field by ID.
   */
  @ApiOperation({
    summary: 'Get custom field by ID',
    description:
      'Returns a single custom field by its ID within an organization. If not found or soft-deleted, returns 404.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '675f3f3b5b1f4a2d1cbbbbbb',
  })
  @ApiParam({
    name: 'customFieldId',
    description: 'Custom field ID (MongoDB ObjectId).',
    example: '675f3f3b5b1f4a2d1caaaaaa',
  })
  @ApiOkResponse({ type: CustomFieldResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid organization id or custom field id.',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Custom field not found.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @Get(':customFieldId')
  async getCustomFieldById(
    @Param('organizationId') organizationId: string,
    @Param('customFieldId') customFieldId: string,
  ): Promise<CustomFieldResponseDto> {
    return this.customFieldsService.getCustomFieldById(
      organizationId,
      customFieldId,
    );
  }

  /**
   * Create a custom field.
   *
   * Auth:
   * - Requires role: admin or manager.
   */
  @ApiOperation({
    summary: 'Create custom field',
    description: 'Creates a custom field inside an organization.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '675f3f3b5b1f4a2d1cbbbbbb',
  })
  @ApiCreatedResponse({ type: CustomFieldResponseDto })
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
  async createCustomField(
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateCustomFieldDto,
  ): Promise<CustomFieldResponseDto> {
    return this.customFieldsService.createCustomField(organizationId, dto);
  }

  /**
   * Update a custom field.
   *
   * Auth:
   * - Requires role: admin or manager.
   */
  @ApiOperation({
    summary: 'Update custom field',
    description:
      'Updates a custom field by ID within an organization. Only non-deleted custom fields can be updated.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '675f3f3b5b1f4a2d1cbbbbbb',
  })
  @ApiParam({
    name: 'customFieldId',
    description: 'Custom field ID (MongoDB ObjectId).',
    example: '675f3f3b5b1f4a2d1caaaaaa',
  })
  @ApiOkResponse({ type: CustomFieldResponseDto })
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
    description: 'Custom field not found.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @Roles('admin', 'manager')
  @Patch(':customFieldId')
  async updateCustomField(
    @Param('organizationId') organizationId: string,
    @Param('customFieldId') customFieldId: string,
    @Body() dto: UpdateCustomFieldDto,
  ): Promise<CustomFieldResponseDto> {
    return this.customFieldsService.updateCustomField(
      organizationId,
      customFieldId,
      dto,
    );
  }

  /**
   * Soft delete a custom field.
   *
   * Auth:
   * - Requires role: admin or manager.
   */
  @ApiOperation({
    summary: 'Soft delete custom field',
    description:
      'Soft deletes a custom field by ID (sets `isDeleted=true`).',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '675f3f3b5b1f4a2d1cbbbbbb',
  })
  @ApiParam({
    name: 'customFieldId',
    description: 'Custom field ID (MongoDB ObjectId).',
    example: '675f3f3b5b1f4a2d1caaaaaa',
  })
  @ApiOkResponse({
    description: 'Custom field soft deleted.',
    schema: {
      type: 'object',
      properties: { success: { type: 'boolean', example: true } },
      required: ['success'],
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid organization id or custom field id.',
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
    description: 'Custom field not found.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @Roles('admin', 'manager')
  @Delete(':customFieldId')
  async softDeleteCustomField(
    @Param('organizationId') organizationId: string,
    @Param('customFieldId') customFieldId: string,
  ): Promise<{ success: true }> {
    await this.customFieldsService.softDeleteCustomField(
      organizationId,
      customFieldId,
    );
    return { success: true };
  }
}
