import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendEmail(
    to: string,
    subject: string,
    template: string,
    context: Record<string, any> = {},
  ): Promise<boolean> {
    try {
      // In production, integrate with email service (SendGrid, AWS SES, etc.)
      this.logger.log(`Sending email to ${to}: ${subject}`);
      this.logger.debug(`Template: ${template}`, context);

      // Placeholder for actual email sending
      // await this.emailClient.send({
      //   to,
      //   subject,
      //   html: this.renderTemplate(template, context),
      // });

      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      return false;
    }
  }

  async sendBulkEmail(
    recipients: string[],
    subject: string,
    template: string,
    context: Record<string, any> = {},
  ): Promise<{ success: number; failed: number }> {
    const results = await Promise.allSettled(
      recipients.map((recipient) =>
        this.sendEmail(recipient, subject, template, context),
      ),
    );

    const success = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return { success, failed };
  }

  // Email templates
  async sendTestAssignmentEmail(
    studentEmail: string,
    studentName: string,
    testTitle: string,
    dueDate: Date,
    assignmentUrl: string,
  ) {
    return this.sendEmail(
      studentEmail,
      'New Test Assignment',
      'test-assignment',
      {
        studentName,
        testTitle,
        dueDate: dueDate.toLocaleDateString(),
        assignmentUrl,
      },
    );
  }

  async sendGradingCompleteEmail(
    studentEmail: string,
    studentName: string,
    testTitle: string,
    bandScore: number,
    resultUrl: string,
  ) {
    return this.sendEmail(
      studentEmail,
      'Test Results Available',
      'grading-complete',
      {
        studentName,
        testTitle,
        bandScore,
        resultUrl,
      },
    );
  }

  async sendReportGeneratedEmail(
    userEmail: string,
    userName: string,
    reportTitle: string,
    downloadUrl: string,
  ) {
    return this.sendEmail(
      userEmail,
      'Report Generated Successfully',
      'report-generated',
      {
        userName,
        reportTitle,
        downloadUrl,
      },
    );
  }

  async sendWelcomeEmail(
    userEmail: string,
    userName: string,
    organizationName: string,
    loginUrl: string,
  ) {
    return this.sendEmail(userEmail, `Welcome to ${organizationName}`, 'welcome', {
      userName,
      organizationName,
      loginUrl,
    });
  }

  async sendPasswordResetEmail(
    userEmail: string,
    userName: string,
    resetToken: string,
    resetUrl: string,
  ) {
    return this.sendEmail(userEmail, 'Password Reset Request', 'password-reset', {
      userName,
      resetToken,
      resetUrl,
    });
  }

  async sendTestReminderEmail(
    studentEmail: string,
    studentName: string,
    testTitle: string,
    dueDate: Date,
    hoursRemaining: number,
  ) {
    return this.sendEmail(
      studentEmail,
      `Reminder: Test Due Soon`,
      'test-reminder',
      {
        studentName,
        testTitle,
        dueDate: dueDate.toLocaleDateString(),
        hoursRemaining,
      },
    );
  }

  // In-app notifications (placeholder for future websocket implementation)
  async sendInAppNotification(
    userId: string,
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
  ) {
    this.logger.log(`In-app notification for ${userId}: ${title}`);
    // TODO: Implement websocket notification system
    return true;
  }

  // Helper method to render email templates
  private renderTemplate(
    template: string,
    context: Record<string, any>,
  ): string {
    // Placeholder - in production, use a template engine like Handlebars
    return `<html><body>${template}</body></html>`;
  }
}
