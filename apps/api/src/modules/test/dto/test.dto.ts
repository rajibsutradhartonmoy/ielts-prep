import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsArray,
  IsObject,
  ValidateNested,
  IsBoolean,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TestSettingsDto {
  @IsOptional()
  @IsBoolean()
  shuffleQuestions?: boolean;

  @IsOptional()
  @IsBoolean()
  showTimer?: boolean;

  @IsOptional()
  @IsBoolean()
  allowPause?: boolean;

  @IsOptional()
  @IsBoolean()
  showProgressBar?: boolean;

  @IsOptional()
  @IsBoolean()
  autoSubmitOnTimeout?: boolean;

  @IsOptional()
  @IsBoolean()
  preventTabSwitch?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxAttempts?: number;
}

export class CreateTestDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['full_test', 'speaking_only', 'writing_only', 'listening_only', 'reading_only'])
  type: string;

  @IsInt()
  @Min(1)
  @Max(240)
  totalDuration: number; // in minutes

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  passingScore?: number;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TestSettingsDto)
  settings?: TestSettingsDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateTestDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['draft', 'published', 'archived'])
  status?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(240)
  totalDuration?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  passingScore?: number;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TestSettingsDto)
  settings?: TestSettingsDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class SectionInstructionsDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  audioUrl?: string;
}

export class CreateSectionDto {
  @IsEnum(['listening', 'reading', 'writing', 'speaking'])
  type: string;

  @IsString()
  title: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SectionInstructionsDto)
  instructions?: SectionInstructionsDto;

  @IsInt()
  @Min(1)
  @Max(120)
  duration: number; // in minutes

  @IsInt()
  @Min(0)
  orderIndex: number;

  @IsOptional()
  @IsString()
  audioUrl?: string;

  @IsOptional()
  @IsString()
  passageText?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class UpdateSectionDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SectionInstructionsDto)
  instructions?: SectionInstructionsDto;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  duration?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;

  @IsOptional()
  @IsString()
  audioUrl?: string;

  @IsOptional()
  @IsString()
  passageText?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class QuestionOptionDto {
  @IsString()
  id: string;

  @IsString()
  label: string;

  @IsString()
  value: string;

  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;
}

export class MatchingItemDto {
  @IsString()
  id: string;

  @IsString()
  left: string;

  @IsString()
  right: string;
}

export class GradingCriteriaDto {
  @IsInt()
  @Min(1)
  maxScore: number;

  @IsOptional()
  @IsString()
  rubric?: string;

  @IsOptional()
  @IsString()
  sampleAnswer?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(9)
  taskAchievement?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(9)
  coherenceCohesion?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(9)
  lexicalResource?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(9)
  grammaticalRange?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(9)
  fluencyCoherence?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(9)
  pronunciation?: number;
}

export class CreateQuestionDto {
  @IsEnum([
    'multiple_choice',
    'true_false_not_given',
    'matching',
    'fill_blank',
    'short_answer',
    'sentence_completion',
    'summary_completion',
    'diagram_labeling',
    'writing_task',
    'speaking_task',
  ])
  type: string;

  @IsString()
  questionText: string;

  @IsInt()
  @Min(0)
  orderIndex: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  points?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionDto)
  options?: QuestionOptionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MatchingItemDto)
  matchingItems?: MatchingItemDto[];

  @IsOptional()
  @IsString()
  correctAnswer?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  acceptableAnswers?: string[];

  @IsOptional()
  @IsBoolean()
  caseSensitive?: boolean;

  @IsOptional()
  @IsString()
  questionInstructions?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => GradingCriteriaDto)
  gradingCriteria?: GradingCriteriaDto;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  audioUrl?: string;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hints?: string[];
}

export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  questionText?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  points?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionDto)
  options?: QuestionOptionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MatchingItemDto)
  matchingItems?: MatchingItemDto[];

  @IsOptional()
  @IsString()
  correctAnswer?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  acceptableAnswers?: string[];

  @IsOptional()
  @IsBoolean()
  caseSensitive?: boolean;

  @IsOptional()
  @IsString()
  questionInstructions?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => GradingCriteriaDto)
  gradingCriteria?: GradingCriteriaDto;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  audioUrl?: string;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hints?: string[];
}

export class ReorderQuestionsDto {
  @IsArray()
  @IsObject({ each: true })
  questions: Array<{ id: string; orderIndex: number }>;
}

export class CloneTestDto {
  @IsOptional()
  @IsString()
  newTitle?: string;

  @IsOptional()
  @IsBoolean()
  includeSections?: boolean;

  @IsOptional()
  @IsBoolean()
  includeQuestions?: boolean;
}
