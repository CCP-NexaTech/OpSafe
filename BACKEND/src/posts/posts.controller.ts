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

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PostsService } from './posts.service';

import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import type { PostResponseDto } from './dto/post-response.dto';
import { Roles } from '../auth/role.decorator';

@Controller()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/organizations/:organizationId/posts')
  async listPosts(
    @Param('organizationId') organizationId: string,
  ): Promise<PostResponseDto[]> {
    return this.postsService.listPosts(organizationId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/organizations/:organizationId/posts/:postId')
  async getPostById(
    @Param('organizationId') organizationId: string,
    @Param('postId') postId: string,
  ): Promise<PostResponseDto> {
    return this.postsService.getPostById(organizationId, postId);
  }

  @Roles('admin', 'manager')
  @UseGuards(JwtAuthGuard)
  @Post('/organizations/:organizationId/posts')
  async createPost(
    @Param('organizationId') organizationId: string,
    @Body() dto: CreatePostDto,
  ): Promise<PostResponseDto> {
    return this.postsService.createPost(organizationId, dto);
  }

  @Roles('admin', 'manager')
  @UseGuards(JwtAuthGuard)
  @Patch('/organizations/:organizationId/posts/:postId')
  async updatePost(
    @Param('organizationId') organizationId: string,
    @Param('postId') postId: string,
    @Body() dto: UpdatePostDto,
  ): Promise<PostResponseDto> {
    return this.postsService.updatePost(organizationId, postId, dto);
  }

  @Roles('admin', 'manager')
  @UseGuards(JwtAuthGuard)
  @Delete('/organizations/:organizationId/posts/:postId')
  async softDeletePost(
    @Param('organizationId') organizationId: string,
    @Param('postId') postId: string,
  ): Promise<{ success: true }> {
    await this.postsService.softDeletePost(organizationId, postId);
    return { success: true };
  }
}
