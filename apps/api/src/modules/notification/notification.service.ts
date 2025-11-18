import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly sesClient: SESClient;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    // Initialize AWS SES client
    this.sesClient = new SESClient({
      region: this.configService.get('AWS_REGION', 'us-east-1'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID', ''),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY', ''),
      },
    });

    this.fromEmail = this.configService.get(
      'SES_FROM_EMAIL',
      'IELTS Prep Platform <noreply@ielts-prep.com>',
    );
  }

  async sendEmail(
    to: string,
    subject: string,
    template: string,
    context: Record<string, any> = {},
  ): Promise<boolean> {
    try {
      const htmlBody = this.renderTemplate(template, context);
      const textBody = this.renderTextTemplate(template, context);

      const command = new SendEmailCommand({
        Source: this.fromEmail,
        Destination: {
          ToAddresses: [to],
        },
        Message: {
          Subject: {
            Data: subject,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: htmlBody,
              Charset: 'UTF-8',
            },
            Text: {
              Data: textBody,
              Charset: 'UTF-8',
            },
          },
        },
      });

      const response = await this.sesClient.send(command);
      this.logger.log(`Email sent successfully to ${to}. MessageId: ${response.MessageId}`);

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

    this.logger.log(`Bulk email completed: ${success} succeeded, ${failed} failed`);
    return { success, failed };
  }

  // Email template methods
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

  async sendEmailVerification(
    userEmail: string,
    userName: string,
    organizationName: string,
    verificationUrl: string,
  ) {
    return this.sendEmail(userEmail, 'Verify Your Email', 'email-verification', {
      userName,
      organizationName,
      verificationUrl,
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

  // Helper methods to render email templates
  private renderTemplate(
    template: string,
    context: Record<string, any>,
  ): string {
    // Template rendering based on template name
    const templates: Record<string, (ctx: any) => string> = {
      'test-assignment': (ctx) => `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9fafb; }
            .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Test Assignment</h1>
            </div>
            <div class="content">
              <p>Hi ${ctx.studentName},</p>
              <p>You have been assigned a new IELTS test: <strong>${ctx.testTitle}</strong></p>
              <p><strong>Due Date:</strong> ${ctx.dueDate}</p>
              <p>Please complete the test before the deadline.</p>
              <a href="${ctx.assignmentUrl}" class="button">Start Test</a>
            </div>
            <div class="footer">
              <p>IELTS Prep Platform - Your path to IELTS success</p>
            </div>
          </div>
        </body>
        </html>
      `,
      'grading-complete': (ctx) => `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10B981; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9fafb; }
            .score { font-size: 48px; color: #10B981; font-weight: bold; text-align: center; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 24px; background: #10B981; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Test Results Available</h1>
            </div>
            <div class="content">
              <p>Hi ${ctx.studentName},</p>
              <p>Your test <strong>${ctx.testTitle}</strong> has been graded!</p>
              <div class="score">Band ${ctx.bandScore}</div>
              <p>Click below to view your detailed results and feedback.</p>
              <a href="${ctx.resultUrl}" class="button">View Results</a>
            </div>
            <div class="footer">
              <p>IELTS Prep Platform - Your path to IELTS success</p>
            </div>
          </div>
        </body>
        </html>
      `,
      'report-generated': (ctx) => `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #8B5CF6; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9fafb; }
            .button { display: inline-block; padding: 12px 24px; background: #8B5CF6; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Report Ready</h1>
            </div>
            <div class="content">
              <p>Hi ${ctx.userName},</p>
              <p>Your report <strong>${ctx.reportTitle}</strong> has been generated successfully.</p>
              <a href="${ctx.downloadUrl}" class="button">Download Report</a>
            </div>
            <div class="footer">
              <p>IELTS Prep Platform - Analytics & Insights</p>
            </div>
          </div>
        </body>
        </html>
      `,
      'email-verification': (ctx) => `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10B981; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9fafb; }
            .button { display: inline-block; padding: 12px 24px; background: #10B981; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Verify Your Email</h1>
            </div>
            <div class="content">
              <p>Hi ${ctx.userName},</p>
              <p>Welcome to ${ctx.organizationName} on the IELTS Prep Platform!</p>
              <p>Please verify your email address by clicking the button below:</p>
              <a href="${ctx.verificationUrl}" class="button">Verify Email</a>
              <p style="margin-top: 20px; color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
            </div>
            <div class="footer">
              <p>IELTS Prep Platform - Your path to IELTS success</p>
            </div>
          </div>
        </body>
        </html>
      `,
      'welcome': (ctx) => `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9fafb; }
            .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to ${ctx.organizationName}!</h1>
            </div>
            <div class="content">
              <p>Hi ${ctx.userName},</p>
              <p>Welcome to the IELTS Prep Platform! Your account has been created successfully.</p>
              <p>Get started by logging in and exploring your dashboard.</p>
              <a href="${ctx.loginUrl}" class="button">Login Now</a>
            </div>
            <div class="footer">
              <p>IELTS Prep Platform - Your path to IELTS success</p>
            </div>
          </div>
        </body>
        </html>
      `,
      'password-reset': (ctx) => `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #EF4444; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9fafb; }
            .button { display: inline-block; padding: 12px 24px; background: #EF4444; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .warning { background: #FEF2F2; border-left: 4px solid #EF4444; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hi ${ctx.userName},</p>
              <p>We received a request to reset your password. Click the button below to reset it.</p>
              <a href="${ctx.resetUrl}" class="button">Reset Password</a>
              <div class="warning">
                <p><strong>Security Notice:</strong></p>
                <p>If you didn't request this password reset, please ignore this email. The link will expire in 1 hour.</p>
              </div>
            </div>
            <div class="footer">
              <p>IELTS Prep Platform - Security Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
      'test-reminder': (ctx) => `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #F59E0B; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9fafb; }
            .urgent { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Test Reminder</h1>
            </div>
            <div class="content">
              <p>Hi ${ctx.studentName},</p>
              <div class="urgent">
                <p><strong>⏰ Reminder:</strong> Your test <strong>${ctx.testTitle}</strong> is due in <strong>${ctx.hoursRemaining} hours</strong>!</p>
                <p><strong>Due Date:</strong> ${ctx.dueDate}</p>
              </div>
              <p>Don't miss the deadline. Complete your test now!</p>
            </div>
            <div class="footer">
              <p>IELTS Prep Platform - Test Reminders</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const templateFn = templates[template];
    if (!templateFn) {
      this.logger.warn(`Template not found: ${template}. Using default template.`);
      return `<html><body><p>Email content for ${template}</p></body></html>`;
    }

    return templateFn(context);
  }

  private renderTextTemplate(
    template: string,
    context: Record<string, any>,
  ): string {
    // Plain text versions of templates
    const textTemplates: Record<string, (ctx: any) => string> = {
      'test-assignment': (ctx) =>
        `Hi ${ctx.studentName},\n\nYou have been assigned a new IELTS test: ${ctx.testTitle}\n\nDue Date: ${ctx.dueDate}\n\nPlease complete the test before the deadline.\n\nStart Test: ${ctx.assignmentUrl}\n\n---\nIELTS Prep Platform`,
      'grading-complete': (ctx) =>
        `Hi ${ctx.studentName},\n\nYour test "${ctx.testTitle}" has been graded!\n\nBand Score: ${ctx.bandScore}\n\nView Results: ${ctx.resultUrl}\n\n---\nIELTS Prep Platform`,
      'report-generated': (ctx) =>
        `Hi ${ctx.userName},\n\nYour report "${ctx.reportTitle}" has been generated successfully.\n\nDownload: ${ctx.downloadUrl}\n\n---\nIELTS Prep Platform`,
      'email-verification': (ctx) =>
        `Hi ${ctx.userName},\n\nWelcome to ${ctx.organizationName} on the IELTS Prep Platform!\n\nPlease verify your email address by clicking the link below:\n\n${ctx.verificationUrl}\n\nThis link will expire in 24 hours.\n\n---\nIELTS Prep Platform`,
      'welcome': (ctx) =>
        `Hi ${ctx.userName},\n\nWelcome to ${ctx.organizationName}!\n\nYour account has been created successfully.\n\nLogin: ${ctx.loginUrl}\n\n---\nIELTS Prep Platform`,
      'password-reset': (ctx) =>
        `Hi ${ctx.userName},\n\nWe received a request to reset your password.\n\nReset your password: ${ctx.resetUrl}\n\nIf you didn't request this, please ignore this email. The link expires in 1 hour.\n\n---\nIELTS Prep Platform`,
      'test-reminder': (ctx) =>
        `Hi ${ctx.studentName},\n\n⏰ REMINDER: Your test "${ctx.testTitle}" is due in ${ctx.hoursRemaining} hours!\n\nDue Date: ${ctx.dueDate}\n\nDon't miss the deadline!\n\n---\nIELTS Prep Platform`,
    };

    const textTemplateFn = textTemplates[template];
    if (!textTemplateFn) {
      return `Email content for ${template}`;
    }

    return textTemplateFn(context);
  }
}
