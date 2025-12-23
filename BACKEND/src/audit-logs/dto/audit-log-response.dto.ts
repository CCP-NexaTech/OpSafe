// BACKEND/src/audit-logs/dto/audit-log-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type {
  AuditLogAction,
  AuditLogEntityType,
} from '../../types/database/auditLogs';

export class AuditLogResponseDto {
  @ApiProperty({
    description: 'Audit log ID (MongoDB ObjectId).',
    example: '675f3f3b5b1f4a2d1caaaaaa',
  })
  id: string;

  @ApiProperty({
    description: 'Organization ID related to this audit log.',
    example: '675f3f3b5b1f4a2d1cbbbbbb',
  })
  organizationId: string;

  @ApiProperty({
    description: 'User ID who performed the action.',
    example: '675f3f3b5b1f4a2d1c999999',
  })
  userId: string;

  @ApiProperty({
    description: 'Action performed.',
    example: 'create',
  })
  action: AuditLogAction;

  @ApiProperty({
    description: 'Entity type affected by the action.',
    example: 'equipment',
  })
  entityType: AuditLogEntityType;

  @ApiPropertyOptional({
    description: 'Entity ID affected by the action (if applicable).',
    example: '675f3f3b5b1f4a2d1c123456',
    nullable: true,
  })
  entityId: string | null;

  @ApiPropertyOptional({
    description: 'IP address from which the action was performed.',
    example: '192.168.0.10',
    nullable: true,
  })
  ip: string | null;

  @ApiPropertyOptional({
    description: 'User agent string of the client.',
    example:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    nullable: true,
  })
  userAgent: string | null;

  @ApiPropertyOptional({
    description:
      'Additional metadata related to the action (key-value pairs).',
    example: { previousStatus: 'available', newStatus: 'in_use' },
    nullable: true,
    type: 'object',
    additionalProperties: {
      oneOf: [
        { type: 'string' },
        { type: 'number' },
        { type: 'boolean' },
        { type: 'null' },
      ],
    },
  })
  metadata: Record<string, string | number | boolean | null> | null;

  @ApiProperty({
    description: 'Creation timestamp.',
    example: '2025-01-15T10:12:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp.',
    example: '2025-01-15T10:12:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Soft delete flag.',
    example: false,
  })
  isDeleted: boolean;
}
