import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { InviteUserDto } from './dto/invite-user.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { UserResponseDto } from './dto/user-response.dto';
import { InviteUserResponseDto } from './dto/invite-user-response.dto';

import {
  ErrorResponseDto,
  ValidationErrorResponseDto,
} from '../shared/dtos/error-response.dto';

@ApiTags('Users')
@Controller('organizations/:organizationId/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Invite a user to an organization.
   *
   * Auth:
   * - Requires JWT.
   *
   * Flow:
   * - Creates a user with `pending` status.
   * - Generates an invitation token.
   * - Enqueues invitation email job.
   */
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Invite user to organization',
    description:
      'Invites a user to an organization. The user will receive an invitation link and must accept it to activate the account.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId)',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiCreatedResponse({ type: InviteUserResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid organization id or invalid request body.',
    type: ValidationErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'User with this email already exists in the organization.',
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
  @Post()
  async inviteUser(
    @Param('organizationId') organizationId: string,
    @Body() body: InviteUserDto,
  ): Promise<InviteUserResponseDto> {
    return this.usersService.inviteUser(organizationId, body);
  }

  /**
   * Accept an invitation and activate user account.
   *
   * Public:
   * - No authentication required.
   *
   * Flow:
   * - Validates invitation token.
   * - Sets password and name.
   * - Activates user.
   */
  @ApiOperation({
    summary: 'Accept user invitation',
    description:
      'Accepts an invitation using a valid token. Activates the user account and sets password.',
  })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({
    description:
      'Invalid or expired invitation token, or invalid request body.',
    type: ValidationErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Invitation not found or already used.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @HttpCode(200)
  @Post('/accept-invite')
  async acceptInvite(
    @Body() body: AcceptInviteDto,
  ): Promise<UserResponseDto> {
    return this.usersService.acceptInvite(body);
  }

  /**
   * List users by organization.
   *
   * Auth:
   * - Requires JWT.
   */
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List users by organization',
    description:
      'Returns all non-deleted users belonging to the specified organization.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId)',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiOkResponse({ type: UserResponseDto, isArray: true })
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
  @UseGuards(JwtAuthGuard)
  @Get()
  async listUsers(
    @Param('organizationId') organizationId: string,
  ): Promise<UserResponseDto[]> {
    return this.usersService.listUsersByOrganization(organizationId);
  }

  /**
   * Get user by ID.
   *
   * Auth:
   * - Requires JWT.
   */
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user by ID',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId)',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID (MongoDB ObjectId)',
    example: '66d1c2a7f1b2c3d4e5f6a7c9',
  })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid organization id or user id.',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  async getUserById(
    @Param('organizationId') organizationId: string,
    @Param('userId') userId: string,
  ): Promise<UserResponseDto> {
    return this.usersService.getUserById(organizationId, userId);
  }

  /**
   * Update user.
   *
   * Auth:
   * - Requires JWT.
   */
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update user',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId)',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID (MongoDB ObjectId)',
    example: '66d1c2a7f1b2c3d4e5f6a7c9',
  })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid IDs or invalid request body.',
    type: ValidationErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  @Patch(':userId')
  async updateUser(
    @Param('organizationId') organizationId: string,
    @Param('userId') userId: string,
    @Body() body: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateUser(organizationId, userId, body);
  }

  /**
   * Soft delete user.
   *
   * Auth:
   * - Requires JWT.
   */
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Soft delete user',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID (MongoDB ObjectId)',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID (MongoDB ObjectId)',
    example: '66d1c2a7f1b2c3d4e5f6a7c9',
  })
  @ApiOkResponse({ description: 'User soft deleted.' })
  @ApiBadRequestResponse({
    description: 'Invalid organization id or user id.',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  @Delete(':userId')
  async deleteUser(
    @Param('organizationId') organizationId: string,
    @Param('userId') userId: string,
  ): Promise<void> {
    await this.usersService.softDeleteUser(organizationId, userId);
  }
}
