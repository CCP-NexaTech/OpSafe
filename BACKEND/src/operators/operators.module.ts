import { Module } from '@nestjs/common';
import { OperatorsService } from './operators.service';
import { OperatorsController } from './operators.controller';

@Module({
  providers: [OperatorsService],
  controllers: [OperatorsController]
})
export class OperatorsModule {}
