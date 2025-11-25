import { ApiProperty } from '@nestjs/swagger';
import type {
  AlertSeverity,
  AlertType,
} from '../../types/database/alerts';

export class AlertResponseDto {
  @ApiProperty({
    description: 'ID do alerta',
    example: '675f3f3b5b1f4a2d1caaaaaa',
  })
  id: string;

  @ApiProperty({
    description: 'ID da organização à qual o alerta pertence',
    example: '675f3f3b5b1f4a2d1cbbbbbb',
  })
  organizationId: string;

  @ApiProperty({
    description: 'Tipo do alerta',
    enum: ['epiExpiry', 'lateReturn', 'maintenanceDue', 'stockLow'],
    example: 'lateReturn',
  })
  type: AlertType;

  @ApiProperty({
    description: 'Severidade do alerta',
    enum: ['info', 'warning', 'critical'],
    example: 'warning',
  })
  severity: AlertSeverity;

  @ApiProperty({
    description: 'Mensagem descritiva do alerta',
    example: 'Equipamento não devolvido dentro do prazo previsto.',
  })
  message: string;

  @ApiProperty({
    description: 'ID do equipamento relacionado ao alerta, se houver',
    example: '675f3f3b5b1f4a2d1c123456',
    nullable: true,
  })
  equipmentId: string | null;

  @ApiProperty({
    description: 'ID do operador relacionado ao alerta, se houver',
    example: '675f3f3b5b1f4a2d1c654321',
    nullable: true,
  })
  operatorId: string | null;

  @ApiProperty({
    description: 'ID do contrato relacionado ao alerta, se houver',
    example: '675f3f3b5b1f4a2d1cabcdef',
    nullable: true,
  })
  contractId: string | null;

  @ApiProperty({
    description: 'Data/hora em que o alerta foi resolvido',
    example: '2025-01-10T14:30:00.000Z',
    nullable: true,
  })
  resolvedAt: Date | null;

  @ApiProperty({
    description: 'ID do usuário que resolveu o alerta',
    example: '675f3f3b5b1f4a2d1c999999',
    nullable: true,
  })
  resolvedByUserId: string | null;

  @ApiProperty({
    description: 'Data de criação do alerta',
    example: '2025-01-09T09:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização do alerta',
    example: '2025-01-10T14:31:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Indica se o alerta foi removido (soft delete)',
    example: false,
  })
  isDeleted: boolean;
}
