import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { AnalyticsService } from '../../analytics/analytics.service';

export interface ReportJob {
  organizationId: string;
  reportType: 'student' | 'test' | 'teacher' | 'organization';
  entityId?: string;
  format: 'pdf' | 'csv' | 'excel' | 'json';
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  requestedBy: string;
}

@Processor('reports')
export class ReportProcessor {
  private readonly logger = new Logger(ReportProcessor.name);

  constructor(private readonly analyticsService: AnalyticsService) {}

  @Process('generate')
  async handleReportGeneration(job: Job<ReportJob>) {
    this.logger.log(
      `Processing report generation job ${job.id} for ${job.data.reportType}`,
    );

    try {
      const report = await this.analyticsService.generateReport(
        job.data.organizationId,
        job.data.reportType,
        {
          entityId: job.data.entityId,
          format: job.data.format,
          startDate: job.data.dateRange.startDate,
          endDate: job.data.dateRange.endDate,
        },
      );

      this.logger.log(`Report generation job ${job.id} completed successfully`);
      return report;
    } catch (error) {
      this.logger.error(
        `Report generation job ${job.id} failed: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Process('batch-reports')
  async handleBatchReportGeneration(
    job: Job<{
      organizationId: string;
      reports: ReportJob[];
    }>,
  ) {
    this.logger.log(
      `Processing batch report generation job ${job.id} with ${job.data.reports.length} reports`,
    );

    const results = [];
    for (const reportJob of job.data.reports) {
      try {
        const report = await this.analyticsService.generateReport(
          reportJob.organizationId,
          reportJob.reportType,
          {
            entityId: reportJob.entityId,
            format: reportJob.format,
            startDate: reportJob.dateRange.startDate,
            endDate: reportJob.dateRange.endDate,
          },
        );
        results.push({ success: true, report });
      } catch (error) {
        this.logger.error(
          `Failed to generate report in batch job ${job.id}`,
          error.stack,
        );
        results.push({ success: false, error: error.message });
      }
    }

    this.logger.log(`Batch report generation job ${job.id} completed`);
    return results;
  }
}
