import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
  IsUUID,
} from 'class-validator';

export class DateRangeDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}

export class GenerateReportDto {
  @IsEnum([
    'student_performance',
    'test_analytics',
    'teacher_performance',
    'organization_overview',
    'batch_progress',
    'custom',
  ])
  reportType: string;

  @IsEnum(['pdf', 'csv', 'excel', 'json'])
  reportFormat: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  dateRange?: DateRangeDto;

  @IsOptional()
  filters?: Record<string, any>;
}

export class GetAnalyticsDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  studentIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  testIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  batchIds?: string[];
}
