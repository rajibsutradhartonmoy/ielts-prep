import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBatchDto {
  @ApiProperty({ example: 'January 2024 Batch' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Morning batch for advanced students' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiPropertyOptional({ example: '2024-04-15' })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}

export class UpdateBatchDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ enum: ['active', 'completed', 'archived'] })
  @IsEnum(['active', 'completed', 'archived'])
  @IsOptional()
  status?: 'active' | 'completed' | 'archived';
}

export class AddStudentsToBatchDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  studentIds: string[];
}

export class AddTeachersToBatchDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  teacherIds: string[];
}

export class BatchQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ enum: ['active', 'completed', 'archived'] })
  @IsEnum(['active', 'completed', 'archived'])
  @IsOptional()
  status?: 'active' | 'completed' | 'archived';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;
}
