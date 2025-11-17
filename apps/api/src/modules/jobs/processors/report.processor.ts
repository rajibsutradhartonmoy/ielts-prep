import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { AnalyticsService } from '../../analytics/analytics.service';

export interface ReportJob {
  organizationId: string;
  reportType: 'student' | 'test' | 'teacher' | 'organization';
  testId?: string;
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
        job.data.requestedBy,
        {
          reportType: job.data.reportType,
          reportFormat: job.data.format,
          title: `${job.data.reportType} Report`,
          dateRange: job.data.dateRange ? {
            startDate: new Date(job.data.dateRange.startDate).toISOString(),
            endDate: new Date(job.data.dateRange.endDate).toISOString(),
          } : undefined,
          filters: job.data.testId ? { testId: job.data.testId } : undefined,
        },
      );

      this.logger.log(`Report generation job ${job.id} completed successfully`);
      return report;
    } catch (error) {
      this.logger.error(
        `Report generation job ${job.id} failed: ${(error as Error).message}`,
        (error as Error).stack,
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
          reportJob.requestedBy,
          {
            reportType: reportJob.reportType,
            reportFormat: reportJob.format,
            title: `${reportJob.reportType} Report`,
            dateRange: reportJob.dateRange ? {
              startDate: new Date(reportJob.dateRange.startDate).toISOString(),
              endDate: new Date(reportJob.dateRange.endDate).toISOString(),
            } : undefined,
            filters: reportJob.testId ? { testId: reportJob.testId } : undefined,
          },
        );
        results.push({ success: true, report });
      } catch (error) {
        this.logger.error(
          `Failed to generate report in batch job ${job.id}`,
          (error as Error).stack,
        );
        results.push({ success: false, error: (error as Error).message });
      }
    }

    this.logger.log(`Batch report generation job ${job.id} completed`);
    return results;
  }
}
