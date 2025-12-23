import type { PostStatus } from '../../types/database/posts';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PostResponseDto {
  @ApiProperty({ example: '66d1c2a7f1b2c3d4e5f6a7aa' })
  id: string;

  @ApiProperty({ example: '66d1c2a7f1b2c3d4e5f6a7b8' })
  organizationId: string;

  @ApiPropertyOptional({ example: '66d1c2a7f1b2c3d4e5f6a7b8' })
  clientId: string;

  @ApiProperty({ example: 'Main Gate' })
  name: string;

  @ApiPropertyOptional({
    example: 'Building A, 1st Floor',
    nullable: true,
  })
  location?: string;

  @ApiPropertyOptional({ example: '66d1c2a7f1b2c3d4e5f6a7b8' })
  contractId: string | null;

  @ApiPropertyOptional({
    example: 'Primary entrance security post',
  })
  description?: string;

  @ApiPropertyOptional({
    example: 'active',
  })
  status: PostStatus;

  @ApiPropertyOptional({
    example: '2025-01-01T08:00:00.000Z',
    nullable: true,
  })
  startTime?: Date | null;

  @ApiPropertyOptional({
    example: '2025-01-01T18:00:00.000Z',
    nullable: true,
  })
  endTime?: Date | null;

  @ApiProperty({ example: '2025-12-23T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-12-23T12:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ example: false })
  isDeleted: boolean;
}


export interface PostResponseDto {
  id: string;
  organizationId: string;
  clientId: string;
  name: string;
  contractId: string | null;
  status: PostStatus;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}
