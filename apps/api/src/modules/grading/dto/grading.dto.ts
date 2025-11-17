import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsArray,
  IsUUID,
  IsEnum,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class WritingScoresDto {
  @IsInt()
  @Min(0)
  @Max(9)
  taskAchievement: number;

  @IsInt()
  @Min(0)
  @Max(9)
  coherenceCohesion: number;

  @IsInt()
  @Min(0)
  @Max(9)
  lexicalResource: number;

  @IsInt()
  @Min(0)
  @Max(9)
  grammaticalRangeAccuracy: number;

  @IsInt()
  @Min(0)
  @Max(9)
  overallBand: number;
}

export class SpeakingScoresDto {
  @IsInt()
  @Min(0)
  @Max(9)
  fluencyCoherence: number;

  @IsInt()
  @Min(0)
  @Max(9)
  lexicalResource: number;

  @IsInt()
  @Min(0)
  @Max(9)
  grammaticalRangeAccuracy: number;

  @IsInt()
  @Min(0)
  @Max(9)
  pronunciation: number;

  @IsInt()
  @Min(0)
  @Max(9)
  overallBand: number;
}

export class SpecificCommentDto {
  @IsString()
  section: string;

  @IsString()
  comment: string;

  @IsOptional()
  @IsString()
  suggestion?: string;
}

export class GradeResponseDto {
  @IsUUID()
  responseId: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => WritingScoresDto)
  writingScores?: WritingScoresDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SpeakingScoresDto)
  speakingScores?: SpeakingScoresDto;

  @IsString()
  overallFeedback: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  strengthsHighlighted?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  areasForImprovement?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpecificCommentDto)
  specificComments?: SpecificCommentDto[];

  @IsOptional()
  @IsString()
  audioFeedbackUrl?: string;

  @IsOptional()
  @IsString()
  annotatedResponse?: string;
}

export class AssignGradingDto {
  @IsUUID()
  teacherId: string;
}

export class UpdateQueueItemDto {
  @IsOptional()
  @IsEnum(['pending', 'in_progress', 'completed', 'disputed'])
  status?: string;

  @IsOptional()
  @IsEnum(['low', 'normal', 'high', 'urgent'])
  priority?: string;
}

export class CreateFeedbackTemplateDto {
  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsString()
  templateText: string;

  @IsOptional()
  @IsBoolean()
  isGlobal?: boolean;
}
