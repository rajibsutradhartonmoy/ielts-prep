import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsArray,
  IsDateString,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TestAssignmentSettingsDto {
  @IsOptional()
  @IsBoolean()
  allowLateSubmission?: boolean;

  @IsOptional()
  @IsBoolean()
  showResultsImmediately?: boolean;

  @IsOptional()
  @IsBoolean()
  showCorrectAnswers?: boolean;

  @IsOptional()
  @IsBoolean()
  sendEmailNotification?: boolean;
}

export class CreateIndividualAssignmentDto {
  @IsUUID()
  testId: string;

  @IsUUID()
  studentId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  dueDate: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TestAssignmentSettingsDto)
  settings?: TestAssignmentSettingsDto;

  @IsOptional()
  @IsString()
  instructions?: string;
}

export class CreateBatchAssignmentDto {
  @IsUUID()
  testId: string;

  @IsUUID()
  batchId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  dueDate: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TestAssignmentSettingsDto)
  settings?: TestAssignmentSettingsDto;

  @IsOptional()
  @IsString()
  instructions?: string;
}

export class UpdateAssignmentDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TestAssignmentSettingsDto)
  settings?: TestAssignmentSettingsDto;

  @IsOptional()
  @IsString()
  instructions?: string;
}

export class SubmitAnswerDto {
  @IsUUID()
  questionId: string;

  answer: any; // Can be string, number, array, etc.

  @IsOptional()
  @IsBoolean()
  flagged?: boolean;
}

export class SaveProgressDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitAnswerDto)
  answers: SubmitAnswerDto[];

  @IsOptional()
  currentSectionIndex?: number;

  @IsOptional()
  currentQuestionIndex?: number;
}

export class SubmitTestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitAnswerDto)
  answers: SubmitAnswerDto[];
}
