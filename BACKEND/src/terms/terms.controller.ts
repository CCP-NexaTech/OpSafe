import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TermsService } from './terms.service';
import { CreateTermDto } from './dto/create-term.dto';
import { UpdateTermDto } from './dto/update-term.dto';
import type { TermResponseDto } from './dto/term-response.dto';
import { Roles } from '../auth/role.decorator';

@Controller()
export class TermsController {
  constructor(private readonly termsService: TermsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/organizations/:organizationId/terms')
  async listTerms(
    @Param('organizationId') organizationId: string,
  ): Promise<TermResponseDto[]> {
    return this.termsService.listTerms(organizationId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/organizations/:organizationId/terms/:termId')
  async getTermById(
    @Param('organizationId') organizationId: string,
    @Param('termId') termId: string,
  ): Promise<TermResponseDto> {
    return this.termsService.getTermById(organizationId, termId);
  }

  @Roles('admin', 'manager')
  @UseGuards(JwtAuthGuard)
  @Post('/organizations/:organizationId/terms')
  async createTerm(
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateTermDto,
  ): Promise<TermResponseDto> {
    return this.termsService.createTerm(organizationId, dto);
  }

  @Roles('admin', 'manager')
  @UseGuards(JwtAuthGuard)
  @Patch('/organizations/:organizationId/terms/:termId')
  async updateTerm(
    @Param('organizationId') organizationId: string,
    @Param('termId') termId: string,
    @Body() dto: UpdateTermDto,
  ): Promise<TermResponseDto> {
    return this.termsService.updateTerm(organizationId, termId, dto);
  }

  @Roles('admin', 'manager')
  @UseGuards(JwtAuthGuard)
  @Delete('/organizations/:organizationId/terms/:termId')
  async softDeleteTerm(
    @Param('organizationId') organizationId: string,
    @Param('termId') termId: string,
  ): Promise<{ success: true }> {
    await this.termsService.softDeleteTerm(organizationId, termId);
    return { success: true };
  }
}
