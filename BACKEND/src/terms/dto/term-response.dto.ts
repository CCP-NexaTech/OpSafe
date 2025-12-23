import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { TermStatus } from '../../types/database/terms';

export class TermResponseDto {
  @ApiProperty({
    description: 'Term ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7ab',
  })
  id: string;

  @ApiProperty({
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  organizationId: string;

  @ApiProperty({
    description: 'Unique term code.',
    example: 'PRIVACY_POLICY',
  })
  code: string;

  @ApiProperty({
    description: 'Public title of the term.',
    example: 'Privacy Policy',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Optional short description of the term.',
    example: 'Rules regarding data usage and privacy.',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Full content of the term (HTML or Markdown).',
    example: '<p>This Privacy Policy explains how we handle your data...</p>',
  })
  content: string;

  @ApiProperty({
    description: 'Version identifier for this term.',
    example: 'v1.0.0',
  })
  version: string;

  @ApiProperty({
    description: 'Current term status.',
    example: 'published',
  })
  status: TermStatus;

  @ApiProperty({
    description: 'Creation timestamp.',
    example: '2025-01-01T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp.',
    example: '2025-02-10T09:30:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Soft delete flag.',
    example: false,
  })
  isDeleted: boolean;
}
