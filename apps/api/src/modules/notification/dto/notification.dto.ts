import { IsString, IsEmail, IsOptional, IsObject, IsArray } from 'class-validator';

export class SendEmailDto {
  @IsEmail()
  to: string;

  @IsString()
  subject: string;

  @IsString()
  template: string;

  @IsOptional()
  @IsObject()
  context?: Record<string, any>;
}

export class SendBulkEmailDto {
  @IsArray()
  @IsEmail({}, { each: true })
  recipients: string[];

  @IsString()
  subject: string;

  @IsString()
  template: string;

  @IsOptional()
  @IsObject()
  context?: Record<string, any>;
}

export class NotificationPreferencesDto {
  @IsOptional()
  emailNotifications?: boolean;

  @IsOptional()
  testAssignmentNotifications?: boolean;

  @IsOptional()
  gradingCompleteNotifications?: boolean;

  @IsOptional()
  reportGeneratedNotifications?: boolean;
}
