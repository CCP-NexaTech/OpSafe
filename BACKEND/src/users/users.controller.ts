import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { InviteUserDto } from './dto/invite-user.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import type { UserResponseDto } from './dto/user-response.dto';
import type { InviteUserResponseDto } from './dto/invite-user-response.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'

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
}
