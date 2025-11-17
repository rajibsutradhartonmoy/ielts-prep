import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MinLength,
  IsEnum,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTeacherDto {
  @ApiProperty({ example: 'teacher@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'Jane Teacher' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'TCH001' })
  @IsString()
  @IsOptional()
  teacherCode?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ enum: ['speaking', 'writing', 'both'] })
  @IsEnum(['speaking', 'writing', 'both'])
  @IsOptional()
  specialization?: 'speaking' | 'writing' | 'both';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({ example: ['IELTS Certified', 'MA in English'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  qualifications?: string[];
}

export class UpdateTeacherDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  teacherCode?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ enum: ['speaking', 'writing', 'both'] })
  @IsEnum(['speaking', 'writing', 'both'])
  @IsOptional()
  specialization?: 'speaking' | 'writing' | 'both';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  qualifications?: string[];

  @ApiPropertyOptional({ enum: ['active', 'inactive'] })
  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: 'active' | 'inactive';
}

export class TeacherQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: ['active', 'inactive'] })
  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: 'active' | 'inactive';

  @ApiPropertyOptional({ enum: ['speaking', 'writing', 'both'] })
  @IsEnum(['speaking', 'writing', 'both'])
  @IsOptional()
  specialization?: 'speaking' | 'writing' | 'both';
}
