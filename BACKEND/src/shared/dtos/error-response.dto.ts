import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 404 })
  statusCode!: number;

  @ApiProperty({ example: 'Not Found' })
  error!: string;

  @ApiProperty({ example: 'Resource not found' })
  message!: string;

  @ApiProperty({
    example: '/organizations/66d1c2a7f1b2c3d4e5f6a7b8/equipments/66d1c2a7f1b2c3d4e5f6a7b9',
  })
  path!: string;

  @ApiProperty({ example: '2025-12-22T13:25:10.123Z' })
  timestamp!: string;

  @ApiProperty({ example: 'b8c5d7b1c3a24d0ea8d9e2af0f8d9c3b' })
  requestId!: string | null;
}

export class ValidationErrorDetailDto {
  @ApiProperty({ example: 'email' })
  field!: string;

  @ApiProperty({ example: ['email must be an email'] })
  messages!: string[];
}

export class ValidationErrorResponseDto extends ErrorResponseDto {
  @ApiPropertyOptional({
    type: [ValidationErrorDetailDto],
    example: [
      { field: 'email', messages: ['email must be an email'] },
      { field: 'name', messages: ['name should not be empty'] },
    ],
  })
  details?: ValidationErrorDetailDto[];
}
