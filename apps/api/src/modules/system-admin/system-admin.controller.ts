import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SystemAdminService } from './system-admin.service';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto/system-admin.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';

// TODO: Add system admin specific guard
@ApiTags('system-admin')
@ApiBearerAuth()
@Controller('system-admin')
export class SystemAdminController {
  constructor(private readonly systemAdminService: SystemAdminService) {}

  @Post('organizations')
  @ApiOperation({ summary: 'Create a new organization' })
  async createOrganization(@Body() dto: CreateOrganizationDto) {
    // TODO: Get system admin ID from JWT
    const systemAdminId = 'system-admin-placeholder';
    return this.systemAdminService.createOrganization(dto, systemAdminId);
  }

  @Get('organizations')
  @ApiOperation({ summary: 'List all organizations' })
  async listOrganizations(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.systemAdminService.listOrganizations(page, limit, search);
  }

  @Get('organizations/:id')
  @ApiOperation({ summary: 'Get organization details' })
  async getOrganization(@Param('id', ParseUUIDPipe) id: string) {
    return this.systemAdminService.getOrganization(id);
  }

  @Patch('organizations/:id')
  @ApiOperation({ summary: 'Update organization' })
  async updateOrganization(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    const systemAdminId = 'system-admin-placeholder';
    return this.systemAdminService.updateOrganization(id, dto, systemAdminId);
  }

  @Post('organizations/:id/suspend')
  @ApiOperation({ summary: 'Suspend organization' })
  async suspendOrganization(@Param('id', ParseUUIDPipe) id: string) {
    const systemAdminId = 'system-admin-placeholder';
    return this.systemAdminService.suspendOrganization(id, systemAdminId);
  }

  @Post('organizations/:id/activate')
  @ApiOperation({ summary: 'Activate organization' })
  async activateOrganization(@Param('id', ParseUUIDPipe) id: string) {
    const systemAdminId = 'system-admin-placeholder';
    return this.systemAdminService.activateOrganization(id, systemAdminId);
  }

  @Get('organizations/:id/usage')
  @ApiOperation({ summary: 'Get organization usage statistics' })
  async getOrganizationUsage(@Param('id', ParseUUIDPipe) id: string) {
    return this.systemAdminService.getOrganizationUsage(id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get system statistics' })
  async getSystemStats() {
    return this.systemAdminService.getSystemStats();
  }
}
