import { Controller, Get } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { AppService } from './app.service';
import { AppResponseDto } from './dto/app-response.dto';
import { ErrorResponseDto } from './shared/dtos/error-response.dto';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Root endpoint.
   *
   * Public:
   * - No authentication required.
   *
   * Purpose:
   * - Returns basic API information.
   * - Useful as a landing endpoint and sanity check.
   *
   * Notes:
   * - This is NOT a health check.
   * - For service health and database connectivity, use `/health`.
   */
  @ApiOperation({
    summary: 'API information',
    description:
      'Returns basic information about the OpSafe API. This endpoint does not perform any health checks.',
  })
  @ApiOkResponse({ type: AppResponseDto })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error.',
    type: ErrorResponseDto,
  })
  @Get()
  getInfo(): AppResponseDto {
    return this.appService.getInfo();
  }
}
