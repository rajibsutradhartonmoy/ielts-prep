import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { AnalyticsService } from '../../analytics/analytics.service';

export interface AnalyticsJob {
  organizationId: string;
  type: 'student' | 'test' | 'teacher' | 'organization';
  entityId?: string;
}

@Processor('analytics')
export class AnalyticsProcessor {
  private readonly logger = new Logger(AnalyticsProcessor.name);

  constructor(private readonly analyticsService: AnalyticsService) {}

  @Process('calculate-student-analytics')
  async handleStudentAnalytics(
    job: Job<{ organizationId: string; studentId: string }>,
  ) {
    this.logger.log(
      `Processing student analytics calculation job ${job.id} for student ${job.data.studentId}`,
    );

    try {
      await this.analyticsService.calculateStudentAnalytics(
        job.data.organizationId,
        job.data.studentId,
      );

      this.logger.log(`Student analytics job ${job.id} completed successfully`);
      return { success: true };
    } catch (error) {
      this.logger.error(
        `Student analytics job ${job.id} failed: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Process('calculate-test-analytics')
  async handleTestAnalytics(job: Job<{ organizationId: string; testId: string }>) {
    this.logger.log(
      `Processing test analytics calculation job ${job.id} for test ${job.data.testId}`,
    );

    try {
      await this.analyticsService.calculateTestAnalytics(
        job.data.organizationId,
        job.data.testId,
      );

      this.logger.log(`Test analytics job ${job.id} completed successfully`);
      return { success: true };
    } catch (error) {
      this.logger.error(
        `Test analytics job ${job.id} failed: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Process('calculate-teacher-analytics')
  async handleTeacherAnalytics(
    job: Job<{ organizationId: string; teacherId: string }>,
  ) {
    this.logger.log(
      `Processing teacher analytics calculation job ${job.id} for teacher ${job.data.teacherId}`,
    );

    try {
      await this.analyticsService.calculateTeacherAnalytics(
        job.data.organizationId,
        job.data.teacherId,
      );

      this.logger.log(`Teacher analytics job ${job.id} completed successfully`);
      return { success: true };
    } catch (error) {
      this.logger.error(
        `Teacher analytics job ${job.id} failed: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Process('calculate-organization-analytics')
  async handleOrganizationAnalytics(job: Job<{ organizationId: string }>) {
    this.logger.log(
      `Processing organization analytics calculation job ${job.id} for org ${job.data.organizationId}`,
    );

    try {
      await this.analyticsService.calculateOrganizationAnalytics(
        job.data.organizationId,
      );

      this.logger.log(`Organization analytics job ${job.id} completed successfully`);
      return { success: true };
    } catch (error) {
      this.logger.error(
        `Organization analytics job ${job.id} failed: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Process('refresh-all-analytics')
  async handleRefreshAllAnalytics(job: Job<{ organizationId: string }>) {
    this.logger.log(
      `Processing refresh all analytics job ${job.id} for org ${job.data.organizationId}`,
    );

    try {
      // This would trigger recalculation of all analytics for the organization
      await this.analyticsService.calculateOrganizationAnalytics(
        job.data.organizationId,
      );

      this.logger.log(`Refresh all analytics job ${job.id} completed successfully`);
      return { success: true };
    } catch (error) {
      this.logger.error(
        `Refresh all analytics job ${job.id} failed: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
