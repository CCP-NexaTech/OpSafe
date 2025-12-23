// BACKEND/src/clients/dto/client-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ClientResponseDto {
  @ApiProperty({ example: '66d1c2a7f1b2c3d4e5f6a7b9' })
  id: string;

  @ApiProperty({ example: '66d1c2a7f1b2c3d4e5f6a7b8' })
  organizationId: string;

  @ApiProperty({ example: 'Acme LTDA' })
  name: string;

  @ApiProperty({ example: '12.345.678/0001-90' })
  document: string;

  @ApiPropertyOptional({ example: 'Maria Silva' })
  mainContactName?: string;

  @ApiPropertyOptional({ example: '+55 85 99999-9999' })
  mainContactPhone?: string;

  @ApiPropertyOptional({ example: 'maria@acme.com' })
  mainContactEmail?: string;

  @ApiPropertyOptional({ example: 'Rua das Flores' })
  addressStreet?: string;

  @ApiPropertyOptional({ example: '123' })
  addressNumber?: string;

  @ApiPropertyOptional({ example: 'Apto 301' })
  addressComplement?: string;

  @ApiPropertyOptional({ example: 'Centro' })
  addressNeighborhood?: string;

  @ApiPropertyOptional({ example: 'Fortaleza' })
  addressCity?: string;

  @ApiPropertyOptional({ example: 'CE' })
  addressState?: string;

  @ApiPropertyOptional({ example: '60000-000' })
  addressZipCode?: string;

  @ApiProperty({ example: '2025-12-23T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-12-23T12:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ example: false })
  isDeleted: boolean;
}
