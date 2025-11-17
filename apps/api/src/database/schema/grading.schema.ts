import {
  pgTable,
  uuid,
  timestamp,
  integer,
  text,
  json,
  boolean,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { testAttempts, questionResponses } from './test-attempt.schema';
import { teachers } from './teacher.schema';
import { organizations } from './organization.schema';

export const gradingQueueStatusEnum = pgEnum('grading_queue_status', [
  'pending',
  'in_progress',
  'completed',
  'disputed',
]);

export const gradingQueuePriorityEnum = pgEnum('grading_queue_priority', [
  'low',
  'normal',
  'high',
  'urgent',
]);

// Queue for manual grading tasks (writing/speaking)
export const gradingQueue = pgTable('grading_queue', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  attemptId: uuid('attempt_id')
    .notNull()
    .references(() => testAttempts.id, { onDelete: 'cascade' }),
  responseId: uuid('response_id')
    .notNull()
    .references(() => questionResponses.id, { onDelete: 'cascade' }),
  assignedTeacherId: uuid('assigned_teacher_id').references(() => teachers.id),
  status: gradingQueueStatusEnum('status').notNull().default('pending'),
  priority: gradingQueuePriorityEnum('priority').notNull().default('normal'),
  questionType: text('question_type').notNull(), // writing_task or speaking_task
  dueDate: timestamp('due_date', { withTimezone: true }),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  estimatedTime: integer('estimated_time'), // in minutes
  metadata: json('metadata').$type<Record<string, any>>().default({}),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export interface WritingScores {
  taskAchievement: number; // 0-9
  coherenceCohesion: number; // 0-9
  lexicalResource: number; // 0-9
  grammaticalRangeAccuracy: number; // 0-9
  overallBand: number; // 0-9
}

export interface SpeakingScores {
  fluencyCoherence: number; // 0-9
  lexicalResource: number; // 0-9
  grammaticalRangeAccuracy: number; // 0-9
  pronunciation: number; // 0-9
  overallBand: number; // 0-9
}

// Detailed feedback for writing/speaking tasks
export const gradingFeedback = pgTable('grading_feedback', {
  id: uuid('id').defaultRandom().primaryKey(),
  responseId: uuid('response_id')
    .notNull()
    .unique()
    .references(() => questionResponses.id, { onDelete: 'cascade' }),
  teacherId: uuid('teacher_id')
    .notNull()
    .references(() => teachers.id),
  // For writing tasks
  writingScores: json('writing_scores').$type<WritingScores>(),
  // For speaking tasks
  speakingScores: json('speaking_scores').$type<SpeakingScores>(),
  overallFeedback: text('overall_feedback').notNull(),
  strengthsHighlighted: json('strengths_highlighted').$type<string[]>(),
  areasForImprovement: json('areas_for_improvement').$type<string[]>(),
  specificComments: json('specific_comments').$type<
    Array<{
      section: string;
      comment: string;
      suggestion?: string;
    }>
  >(),
  // Audio feedback URL for speaking
  audioFeedbackUrl: text('audio_feedback_url'),
  // Annotated text for writing
  annotatedResponse: text('annotated_response'),
  timeSpentGrading: integer('time_spent_grading'), // in seconds
  metadata: json('metadata').$type<Record<string, any>>().default({}),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Store common feedback templates
export const feedbackTemplates = pgTable('feedback_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  teacherId: uuid('teacher_id').references(() => teachers.id),
  name: text('name').notNull(),
  category: text('category').notNull(), // e.g., "coherence", "grammar", "vocabulary"
  templateText: text('template_text').notNull(),
  isGlobal: boolean('is_global').default(false), // Available to all teachers
  usageCount: integer('usage_count').default(0),
  metadata: json('metadata').$type<Record<string, any>>().default({}),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Track teacher grading performance
export const teacherGradingStats = pgTable('teacher_grading_stats', {
  id: uuid('id').defaultRandom().primaryKey(),
  teacherId: uuid('teacher_id')
    .notNull()
    .unique()
    .references(() => teachers.id, { onDelete: 'cascade' }),
  totalGraded: integer('total_graded').default(0),
  writingTasksGraded: integer('writing_tasks_graded').default(0),
  speakingTasksGraded: integer('speaking_tasks_graded').default(0),
  averageTimePerGrading: integer('average_time_per_grading'), // in seconds
  averageScoreGiven: integer('average_score_given'), // 0-100
  lastGradedAt: timestamp('last_graded_at', { withTimezone: true }),
  currentQueueSize: integer('current_queue_size').default(0),
  metadata: json('metadata').$type<Record<string, any>>().default({}),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
