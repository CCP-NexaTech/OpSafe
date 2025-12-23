import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post as HttpPost,
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

import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostResponseDto } from './dto/post-response.dto';

import {
  ErrorResponseDto,
  ValidationErrorResponseDto,
} from '../shared/dtos/error-response.dto';

@ApiTags('Posts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('organizations/:organizationId/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  /**
   * List all posts (non-deleted) for an organization.
   */
  @ApiOperation({
    summary: 'List posts',
    description:
      'Returns all posts for a given organization that are not soft-deleted.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiOkResponse({ type: PostResponseDto, isArray: true })
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
  async listPosts(
    @Param('organizationId') organizationId: string,
  ): Promise<PostResponseDto[]> {
    return this.postsService.listPosts(organizationId);
  }

  /**
   * Get a post by ID.
   */
  @ApiOperation({
    summary: 'Get post by ID',
    description:
      'Returns a single post by its ID within an organization. If not found or soft-deleted, returns 404.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiParam({
    name: 'postId',
    description: 'Post ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7aa',
  })
  @ApiOkResponse({ type: PostResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid organization id or post id.',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Post not found.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @Get(':postId')
  async getPostById(
    @Param('organizationId') organizationId: string,
    @Param('postId') postId: string,
  ): Promise<PostResponseDto> {
    return this.postsService.getPostById(organizationId, postId);
  }

  /**
   * Create a post.
   */
  @ApiOperation({
    summary: 'Create post',
    description: 'Creates a post inside an organization.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiCreatedResponse({ type: PostResponseDto })
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
  @HttpPost()
  async createPost(
    @Param('organizationId') organizationId: string,
    @Body() dto: CreatePostDto,
  ): Promise<PostResponseDto> {
    return this.postsService.createPost(organizationId, dto);
  }

  /**
   * Update a post.
   */
  @ApiOperation({
    summary: 'Update post',
    description:
      'Updates a post by ID within an organization. Only non-deleted posts can be updated.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiParam({
    name: 'postId',
    description: 'Post ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7aa',
  })
  @ApiOkResponse({ type: PostResponseDto })
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
    description: 'Post not found.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @Roles('admin', 'manager')
  @Patch(':postId')
  async updatePost(
    @Param('organizationId') organizationId: string,
    @Param('postId') postId: string,
    @Body() dto: UpdatePostDto,
  ): Promise<PostResponseDto> {
    return this.postsService.updatePost(organizationId, postId, dto);
  }

  /**
   * Soft delete a post.
   */
  @ApiOperation({
    summary: 'Soft delete post',
    description:
      'Soft deletes a post by ID (sets `isDeleted=true` and timestamps).',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiParam({
    name: 'postId',
    description: 'Post ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7aa',
  })
  @ApiOkResponse({
    description: 'Post soft deleted.',
    schema: {
      type: 'object',
      properties: { success: { type: 'boolean', example: true } },
      required: ['success'],
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid organization id or post id.',
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
    description: 'Post not found.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @Roles('admin', 'manager')
  @Delete(':postId')
  async softDeletePost(
    @Param('organizationId') organizationId: string,
    @Param('postId') postId: string,
  ): Promise<{ success: true }> {
    await this.postsService.softDeletePost(organizationId, postId);
    return { success: true };
  }
}
