import { Inject, Injectable } from '@nestjs/common';
import { Db } from 'mongodb';
import { DATABASE_CONNECTION } from '../database/database.module';
import type { HealthResponseDto } from './dto/health-response.dto';

@Injectable()
export class HealthService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Db,
  ) {}

  async check(): Promise<HealthResponseDto> {
    await this.db.command({ ping: 1 });

    return {
      status: 'ok',
      database: 'connected',
    };
  }
}
