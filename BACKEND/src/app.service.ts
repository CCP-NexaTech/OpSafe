import { Injectable } from '@nestjs/common';
import type { AppResponseDto } from './dto/app-response.dto';

@Injectable()
export class AppService {
  getInfo(): AppResponseDto {
    return {
      name: 'OpSafe API',
      description: 'Operational Safety & Equipment Management',
      version: '1.0.0',
    };
  }
}
