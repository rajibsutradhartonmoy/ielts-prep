import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthenticatedRequest } from '../../common/types/request.types';
import { AnalyticsService } from './analytics.service';
import { GenerateReportDto, GetAnalyticsDto } from './dto/analytics.dto';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // Organization Dashboard
  @Get('dashboard')
  @Roles('organization_admin')
  async getOrganizationDashboard(
    @Request() req: AuthenticatedRequest,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const dto: GetAnalyticsDto = { startDate, endDate };
    return this.analyticsService.getOrganizationDashboard(
      req.user.organizationId,
      dto,
    );
  }

  // Student Analytics
  @Get('students/:studentId')
  @Roles('organization_admin', 'teacher', 'student')
  async getStudentAnalytics(
    @Request() req: AuthenticatedRequest,
    @Param('studentId') studentId: string,
  ) {
    // Students can only view their own analytics
    if (req.user.role === 'student' && req.user.studentId !== studentId) {
      throw new Error('Unauthorized');
    }

    return this.analyticsService.getStudentAnalytics(studentId);
  }

  // Test Analytics
  @Get('tests/:testId')
  @Roles('organization_admin', 'teacher')
  async getTestAnalytics(@Request() req: AuthenticatedRequest, @Param('testId') testId: string) {
    return this.analyticsService.getTestAnalytics(testId);
  }

  @Get('tests/:testId/performance')
  @Roles('organization_admin', 'teacher')
  async getTestPerformanceAnalytics(
    @Request() req: AuthenticatedRequest,
    @Param('testId') testId: string,
  ) {
    return this.analyticsService.getTestPerformanceAnalytics(
      req.user.organizationId,
      testId,
    );
  }

  // Student Performance Report
  @Post('reports/student-performance')
  @Roles('organization_admin', 'teacher')
  async getStudentPerformanceReport(
    @Request() req: AuthenticatedRequest,
    @Body() dto: GetAnalyticsDto,
  ) {
    return this.analyticsService.getStudentPerformanceReport(
      req.user.organizationId,
      dto,
    );
  }

  // Generate Report
  @Post('reports/generate')
  @Roles('organization_admin', 'teacher')
  async generateReport(@Request() req: AuthenticatedRequest, @Body() dto: GenerateReportDto) {
    return this.analyticsService.generateReport(
      req.user.organizationId,
      req.user.id,
      dto,
    );
  }

  @Get('reports')
  @Roles('organization_admin', 'teacher')
  async getGeneratedReports(
    @Request() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.analyticsService.getGeneratedReports(
      req.user.organizationId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('reports/:reportId')
  @Roles('organization_admin', 'teacher')
  async getReport(@Request() req: AuthenticatedRequest, @Param('reportId') reportId: string) {
    return this.analyticsService.getReport(req.user.organizationId, reportId);
  }
}
