import { Controller, Get } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { HealthService } from './health.service';
import { HealthResponseDto } from './dto/health-response.dto';
import { ErrorResponseDto } from '../shared/dtos/error-response.dto';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * Basic health check endpoint.
   *
   * Public:
   * - No authentication required.
   *
   * What it verifies:
   * - Database connectivity (MongoDB ping).
   */
  @ApiOperation({
    summary: 'Health check',
    description:
      'Returns the service health status and verifies database connectivity via MongoDB ping.',
  })
  @ApiOkResponse({ type: HealthResponseDto })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error (e.g., database not reachable).',
    type: ErrorResponseDto,
  })
  @Get()
  async getHealth(): Promise<HealthResponseDto> {
    return this.healthService.check();
  }
}
