import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type {
  AlertSeverity,
  AlertType,
} from '../../types/database/alerts';

export class CreateAlertDto {
  @ApiProperty({
    description: 'Tipo do alerta',
    enum: ['epiExpiry', 'lateReturn', 'maintenanceDue', 'stockLow'],
    example: 'lateReturn',
  })
  @IsEnum(['epiExpiry', 'lateReturn', 'maintenanceDue', 'stockLow'])
  type: AlertType;

  @ApiProperty({
    description: 'Severidade do alerta',
    enum: ['info', 'warning', 'critical'],
    example: 'warning',
  })
  @IsEnum(['info', 'warning', 'critical'])
  severity: AlertSeverity;

  @ApiProperty({
    description: 'Mensagem descritiva do alerta',
    maxLength: 500,
    example: 'Equipamento não devolvido dentro do prazo previsto.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  message: string;

  @ApiPropertyOptional({
    description: 'ID do equipamento relacionado ao alerta (se aplicável)',
    example: '675f3f3b5b1f4a2d1c123456',
  })
  @IsOptional()
  @IsMongoId()
  equipmentId?: string;

  @ApiPropertyOptional({
    description: 'ID do operador relacionado ao alerta (se aplicável)',
    example: '675f3f3b5b1f4a2d1c654321',
  })
  @IsOptional()
  @IsMongoId()
  operatorId?: string;

  @ApiPropertyOptional({
    description: 'ID do contrato relacionado ao alerta (se aplicável)',
    example: '675f3f3b5b1f4a2d1cabcdef',
  })
  @IsOptional()
  @IsMongoId()
  contractId?: string;

  @ApiPropertyOptional({
    description: 'ID do usuário que resolveu o alerta (se já estiver resolvido)',
    example: '675f3f3b5b1f4a2d1c999999',
  })
  @IsOptional()
  @IsMongoId()
  resolvedByUserId?: string;

  @ApiPropertyOptional({
    description: 'Data/hora em que o alerta foi resolvido (ISO 8601)',
    example: '2025-01-10T14:30:00.000Z',
  })
  @IsOptional()
  @IsString()
  resolvedAt?: string;
}
