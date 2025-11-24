import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Patch,
  Delete,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { InviteUserDto } from './dto/invite-user.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import type { UserResponseDto } from './dto/user-response.dto';
import type { InviteUserResponseDto } from './dto/invite-user-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/organizations/:organizationId/users/invite')
  async inviteUser(
    @Param('organizationId') organizationId: string,
    @Body() inviteUserDto: InviteUserDto,
  ): Promise<InviteUserResponseDto> {
    return this.usersService.inviteUser(organizationId, inviteUserDto);
  }

  @Post('users/accept-invite')
  async acceptInvite(
    @Body() acceptInviteDto: AcceptInviteDto,
  ): Promise<UserResponseDto> {
    return this.usersService.acceptInvite(acceptInviteDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('organizations/:organizationId/users')
  async listUsers(
    @Param('organizationId') organizationId: string,
  ): Promise<UserResponseDto[]> {
    return this.usersService.listUsersByOrganization(organizationId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('organizations/:organizationId/users/:userId')
  async getUserById(
    @Param('organizationId') organizationId: string,
    @Param('userId') userId: string,
  ): Promise<UserResponseDto> {
    return this.usersService.getUserById(organizationId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('organizations/:organizationId/users/:userId')
  async updateUser(
    @Param('organizationId') organizationId: string,
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateUser(organizationId, userId, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('organizations/:organizationId/users/:userId')
  async softDeleteUser(
    @Param('organizationId') organizationId: string,
    @Param('userId') userId: string,
  ): Promise<{ success: boolean }> {
    await this.usersService.softDeleteUser(organizationId, userId);
    return { success: true };
  }
}
