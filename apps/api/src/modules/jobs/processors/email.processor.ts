import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { NotificationService } from '../../notification/notification.service';

export interface EmailJob {
  to: string;
  subject: string;
  template: string;
  context?: Record<string, any>;
}

export interface BulkEmailJob {
  recipients: string[];
  subject: string;
  template: string;
  context?: Record<string, any>;
}

@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly notificationService: NotificationService) {}

  @Process('send-single')
  async handleSingleEmail(job: Job<EmailJob>) {
    this.logger.log(`Processing email job ${job.id} to ${job.data.to}`);

    try {
      await this.notificationService.sendEmail(
        job.data.to,
        job.data.subject,
        job.data.template,
        job.data.context,
      );

      this.logger.log(`Email job ${job.id} completed successfully`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Email job ${job.id} failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('send-bulk')
  async handleBulkEmail(job: Job<BulkEmailJob>) {
    this.logger.log(
      `Processing bulk email job ${job.id} to ${job.data.recipients.length} recipients`,
    );

    try {
      const result = await this.notificationService.sendBulkEmail(
        job.data.recipients,
        job.data.subject,
        job.data.template,
        job.data.context,
      );

      this.logger.log(
        `Bulk email job ${job.id} completed: ${result.success} succeeded, ${result.failed} failed`,
      );
      return result;
    } catch (error) {
      this.logger.error(`Bulk email job ${job.id} failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('test-assignment-reminder')
  async handleTestAssignmentReminder(
    job: Job<{
      studentEmail: string;
      studentName: string;
      testTitle: string;
      dueDate: Date;
      assignmentUrl: string;
    }>,
  ) {
    this.logger.log(`Processing test assignment reminder ${job.id}`);

    try {
      await this.notificationService.sendTestAssignmentEmail(
        job.data.studentEmail,
        job.data.studentName,
        job.data.testTitle,
        job.data.dueDate,
        job.data.assignmentUrl,
      );

      return { success: true };
    } catch (error) {
      this.logger.error(`Test assignment reminder ${job.id} failed`, error.stack);
      throw error;
    }
  }
}
