import type { UserResponseDto } from './user-response.dto';

export interface InviteUserResponseDto extends UserResponseDto {
  acceptInviteUrl: string;
}
