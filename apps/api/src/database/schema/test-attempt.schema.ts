import {
  pgTable,
  uuid,
  timestamp,
  integer,
  boolean,
  json,
  text,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { organizations } from './organization.schema';
import { tests } from './test.schema';
import { students } from './student.schema';
import { batches } from './batch.schema';

export const testAssignmentTypeEnum = pgEnum('test_assignment_type', [
  'individual',
  'batch',
]);

export const testAttemptStatusEnum = pgEnum('test_attempt_status', [
  'not_started',
  'in_progress',
  'submitted',
  'graded',
  'expired',
]);

export interface TestAssignmentSettings {
  allowLateSubmission?: boolean;
  showResultsImmediately?: boolean;
  showCorrectAnswers?: boolean;
  sendEmailNotification?: boolean;
}

export const testAssignments = pgTable('test_assignments', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  testId: uuid('test_id')
    .notNull()
    .references(() => tests.id, { onDelete: 'cascade' }),
  assignmentType: testAssignmentTypeEnum('assignment_type').notNull(),
  // For individual assignments
  studentId: uuid('student_id').references(() => students.id, {
    onDelete: 'cascade',
  }),
  // For batch assignments
  batchId: uuid('batch_id').references(() => batches.id, {
    onDelete: 'cascade',
  }),
  assignedById: uuid('assigned_by_id').notNull(),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  dueDate: timestamp('due_date', { withTimezone: true }).notNull(),
  settings: json('settings').$type<TestAssignmentSettings>().default({
    allowLateSubmission: false,
    showResultsImmediately: false,
    showCorrectAnswers: false,
    sendEmailNotification: true,
  }),
  instructions: text('instructions'),
  metadata: json('metadata').$type<Record<string, any>>().default({}),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export interface StudentAnswer {
  questionId: string;
  answer: any; // Can be string, array (for matching), etc.
  timeSpent?: number; // in seconds
  flagged?: boolean;
}

export interface AttemptMetrics {
  totalTimeSpent: number; // in seconds
  questionsAnswered: number;
  questionsFlagged: number;
  sectionTimes: Record<string, number>; // sectionId -> time spent
  tabSwitches?: number;
  pauseCount?: number;
}

export const testAttempts = pgTable('test_attempts', {
  id: uuid('id').defaultRandom().primaryKey(),
  assignmentId: uuid('assignment_id')
    .notNull()
    .references(() => testAssignments.id, { onDelete: 'cascade' }),
  studentId: uuid('student_id')
    .notNull()
    .references(() => students.id, { onDelete: 'cascade' }),
  testId: uuid('test_id')
    .notNull()
    .references(() => tests.id),
  attemptNumber: integer('attempt_number').notNull().default(1),
  status: testAttemptStatusEnum('status').notNull().default('not_started'),
  startedAt: timestamp('started_at', { withTimezone: true }),
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }), // When fully graded
  answers: json('answers').$type<StudentAnswer[]>().default([]),
  currentSectionIndex: integer('current_section_index').default(0),
  currentQuestionIndex: integer('current_question_index').default(0),
  timeRemaining: integer('time_remaining'), // in seconds
  metrics: json('metrics').$type<AttemptMetrics>(),
  // Scores (filled after grading)
  rawScore: integer('raw_score'),
  maxScore: integer('max_score'),
  percentageScore: integer('percentage_score'),
  bandScore: integer('band_score'), // IELTS band score (0-9)
  isPassed: boolean('is_passed'),
  metadata: json('metadata').$type<Record<string, any>>().default({}),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Track individual question responses for detailed analytics
export const questionResponses = pgTable('question_responses', {
  id: uuid('id').defaultRandom().primaryKey(),
  attemptId: uuid('attempt_id')
    .notNull()
    .references(() => testAttempts.id, { onDelete: 'cascade' }),
  questionId: uuid('question_id').notNull(),
  sectionId: uuid('section_id').notNull(),
  studentAnswer: json('student_answer').$type<any>(),
  isCorrect: boolean('is_correct'),
  pointsEarned: integer('points_earned'),
  maxPoints: integer('max_points').notNull(),
  timeSpent: integer('time_spent'), // in seconds
  flagged: boolean('flagged').default(false),
  // For manual grading (writing/speaking)
  needsManualGrading: boolean('needs_manual_grading').default(false),
  gradedById: uuid('graded_by_id'),
  gradedAt: timestamp('graded_at', { withTimezone: true }),
  feedback: text('feedback'),
  // For writing/speaking detailed scores
  detailedScores: json('detailed_scores').$type<Record<string, number>>(),
  metadata: json('metadata').$type<Record<string, any>>().default({}),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
