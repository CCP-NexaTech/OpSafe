import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationResponseDto } from './dto/organization-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async list(): Promise<OrganizationResponseDto[]> {
    return this.organizationsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(@Param('id') id: string): Promise<OrganizationResponseDto> {
    const organization = await this.organizationsService.findById(id);

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  @Post()
  async create(
    @Body() body: CreateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    return this.organizationsService.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    const organization = await this.organizationsService.update(id, body);

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    const deleted = await this.organizationsService.softDelete(id);

    if (!deleted) {
      throw new NotFoundException('Organization not found');
    }
  }
}
