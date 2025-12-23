import { ApiProperty } from '@nestjs/swagger';

export class AppResponseDto {
  @ApiProperty({
    example: 'OpSafe API',
  })
  name!: string;

  @ApiProperty({
    example: 'Operational Safety & Equipment Management',
  })
  description!: string;

  @ApiProperty({
    example: '1.0.0',
  })
  version!: string;
}
