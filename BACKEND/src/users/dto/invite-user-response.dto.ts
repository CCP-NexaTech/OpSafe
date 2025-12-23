import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';

export class InviteUserResponseDto extends UserResponseDto {
  @ApiProperty({
    example:
      'https://app.opsafe.com.br/accept-invite?token=eyJhbGciOi...',
    description: 'URL used by the invited user to accept the invitation.',
  })
  acceptInviteUrl!: string;
}
