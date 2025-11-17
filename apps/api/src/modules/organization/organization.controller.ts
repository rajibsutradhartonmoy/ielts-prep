import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationService } from './organization.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';

@ApiTags('organization')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get()
  @ApiOperation({ summary: 'Get current organization details' })
  async getOrganization(@CurrentUser('organizationId') orgId: string) {
    return this.organizationService.getOrganization(orgId);
  }

  @Patch()
  @Roles('organization_admin')
  @ApiOperation({ summary: 'Update organization info' })
  async updateOrganization(
    @CurrentUser('organizationId') orgId: string,
    @Body() data: { name?: string; email?: string; phone?: string; address?: any },
  ) {
    return this.organizationService.updateOrganizationInfo(orgId, data);
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get organization settings' })
  async getSettings(@CurrentUser('organizationId') orgId: string) {
    return this.organizationService.getOrganizationSettings(orgId);
  }

  @Patch('settings')
  @Roles('organization_admin')
  @ApiOperation({ summary: 'Update organization settings' })
  async updateSettings(
    @CurrentUser('organizationId') orgId: string,
    @Body() settings: any,
  ) {
    return this.organizationService.updateOrganizationSettings(orgId, settings);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get organization dashboard statistics' })
  async getStats(@CurrentUser('organizationId') orgId: string) {
    return this.organizationService.getOrganizationStats(orgId);
  }

  @Get('usage')
  @ApiOperation({ summary: 'Get organization usage statistics' })
  async getUsage(@CurrentUser('organizationId') orgId: string) {
    return this.organizationService.getUsageStatistics(orgId);
  }
}
