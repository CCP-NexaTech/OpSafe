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
import { CustomFieldsService } from './custom-fields.service';
import { CreateCustomFieldDto } from './dto/create-custom-field.dto';
import { UpdateCustomFieldDto } from './dto/update-custom-field.dto';
import type { CustomFieldResponseDto } from './dto/custom-field-response.dto';
import { Roles } from '../auth/role.decorator';

@Controller()
export class CustomFieldsController {
  constructor(private readonly customFieldsService: CustomFieldsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/organizations/:organizationId/custom-fields')
  async listCustomFields(
    @Param('organizationId') organizationId: string,
  ): Promise<CustomFieldResponseDto[]> {
    return this.customFieldsService.listCustomFields(organizationId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/organizations/:organizationId/custom-fields/:customFieldId')
  async getCustomFieldById(
    @Param('organizationId') organizationId: string,
    @Param('customFieldId') customFieldId: string,
  ): Promise<CustomFieldResponseDto> {
    return this.customFieldsService.getCustomFieldById(
      organizationId,
      customFieldId,
    );
  }

  @Roles('admin', 'manager')
  @UseGuards(JwtAuthGuard)
  @Post('/organizations/:organizationId/custom-fields')
  async createCustomField(
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateCustomFieldDto,
  ): Promise<CustomFieldResponseDto> {
    return this.customFieldsService.createCustomField(organizationId, dto);
  }

  @Roles('admin', 'manager')
  @UseGuards(JwtAuthGuard)
  @Patch('/organizations/:organizationId/custom-fields/:customFieldId')
  async updateCustomField(
    @Param('organizationId') organizationId: string,
    @Param('customFieldId') customFieldId: string,
    @Body() dto: UpdateCustomFieldDto,
  ): Promise<CustomFieldResponseDto> {
    return this.customFieldsService.updateCustomField(
      organizationId,
      customFieldId,
      dto,
    );
  }

  @Roles('admin', 'manager')
  @UseGuards(JwtAuthGuard)
  @Delete('/organizations/:organizationId/custom-fields/:customFieldId')
  async softDeleteCustomField(
    @Param('organizationId') organizationId: string,
    @Param('customFieldId') customFieldId: string,
  ): Promise<{ success: true }> {
    await this.customFieldsService.softDeleteCustomField(
      organizationId,
      customFieldId,
    );
    return { success: true };
  }
}
