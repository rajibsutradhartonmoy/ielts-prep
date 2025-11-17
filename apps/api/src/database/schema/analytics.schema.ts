import {
  pgTable,
  uuid,
  timestamp,
  integer,
  json,
  text,
  boolean,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { organizations } from './organization.schema';
import { students } from './student.schema';
import { teachers } from './teacher.schema';
import { tests } from './test.schema';

export const reportTypeEnum = pgEnum('report_type', [
  'student_performance',
  'test_analytics',
  'teacher_performance',
  'organization_overview',
  'batch_progress',
  'custom',
]);

export const reportFormatEnum = pgEnum('report_format', [
  'pdf',
  'csv',
  'excel',
  'json',
]);

export const reportStatusEnum = pgEnum('report_status', [
  'pending',
  'processing',
  'completed',
  'failed',
]);

// Store aggregated analytics data
export const studentAnalytics = pgTable('student_analytics', {
  id: uuid('id').defaultRandom().primaryKey(),
  studentId: uuid('student_id')
    .notNull()
    .unique()
    .references(() => students.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  // Overall stats
  totalTestsTaken: integer('total_tests_taken').default(0),
  totalTestsPassed: integer('total_tests_passed').default(0),
  averageBandScore: integer('average_band_score'), // 0-90 (multiply by 10 for decimal)
  bestBandScore: integer('best_band_score'),
  // Section performance
  listeningAvgScore: integer('listening_avg_score'),
  readingAvgScore: integer('reading_avg_score'),
  writingAvgScore: integer('writing_avg_score'),
  speakingAvgScore: integer('speaking_avg_score'),
  // Time tracking
  totalTimeSpent: integer('total_time_spent'), // in seconds
  averageTimePerTest: integer('average_time_per_test'),
  // Improvement tracking
  scoreImprovement: integer('score_improvement'), // percentage
  weakAreas: json('weak_areas').$type<string[]>(),
  strongAreas: json('strong_areas').$type<string[]>(),
  // Recent activity
  lastTestDate: timestamp('last_test_date', { withTimezone: true }),
  testsThisMonth: integer('tests_this_month').default(0),
  testsThisWeek: integer('tests_this_week').default(0),
  metadata: json('metadata').$type<Record<string, any>>().default({}),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const testAnalytics = pgTable('test_analytics', {
  id: uuid('id').defaultRandom().primaryKey(),
  testId: uuid('test_id')
    .notNull()
    .unique()
    .references(() => tests.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  // Attempt stats
  totalAttempts: integer('total_attempts').default(0),
  completedAttempts: integer('completed_attempts').default(0),
  averageScore: integer('average_score'),
  averageBandScore: integer('average_band_score'),
  passRate: integer('pass_rate'), // percentage
  // Time stats
  averageCompletionTime: integer('average_completion_time'), // in seconds
  // Difficulty metrics
  difficultyRating: integer('difficulty_rating'), // 1-10
  questionsWithLowAccuracy: json('questions_with_low_accuracy').$type<
    Array<{ questionId: string; accuracy: number }>
  >(),
  // Score distribution
  scoreDistribution: json('score_distribution').$type<
    Record<string, number>
  >(), // band -> count
  metadata: json('metadata').$type<Record<string, any>>().default({}),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const teacherAnalytics = pgTable('teacher_analytics', {
  id: uuid('id').defaultRandom().primaryKey(),
  teacherId: uuid('teacher_id')
    .notNull()
    .unique()
    .references(() => teachers.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  // Grading stats
  totalGraded: integer('total_graded').default(0),
  writingTasksGraded: integer('writing_tasks_graded').default(0),
  speakingTasksGraded: integer('speaking_tasks_graded').default(0),
  averageGradingTime: integer('average_grading_time'), // in seconds
  // Quality metrics
  averageScoreGiven: integer('average_score_given'),
  feedbackQualityScore: integer('feedback_quality_score'), // 1-10
  studentSatisfactionScore: integer('student_satisfaction_score'), // 1-10
  // Performance
  gradedThisMonth: integer('graded_this_month').default(0),
  gradedThisWeek: integer('graded_this_week').default(0),
  currentQueueSize: integer('current_queue_size').default(0),
  averageResponseTime: integer('average_response_time'), // in hours
  metadata: json('metadata').$type<Record<string, any>>().default({}),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const organizationAnalytics = pgTable('organization_analytics', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id')
    .notNull()
    .unique()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  // User stats
  totalStudents: integer('total_students').default(0),
  activeStudents: integer('active_students').default(0),
  totalTeachers: integer('total_teachers').default(0),
  totalBatches: integer('total_batches').default(0),
  // Test stats
  totalTests: integer('total_tests').default(0),
  publishedTests: integer('published_tests').default(0),
  totalAttempts: integer('total_attempts').default(0),
  completedAttempts: integer('completed_attempts').default(0),
  // Performance metrics
  overallPassRate: integer('overall_pass_rate'),
  averageBandScore: integer('average_band_score'),
  studentEngagementRate: integer('student_engagement_rate'), // percentage
  // Usage stats
  testsCreatedThisMonth: integer('tests_created_this_month').default(0),
  testsAssignedThisMonth: integer('tests_assigned_this_month').default(0),
  activeStudentsThisMonth: integer('active_students_this_month').default(0),
  // Storage
  storageUsedMb: integer('storage_used_mb').default(0),
  metadata: json('metadata').$type<Record<string, any>>().default({}),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Generated reports
export const generatedReports = pgTable('generated_reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  generatedById: uuid('generated_by_id').notNull(),
  reportType: reportTypeEnum('report_type').notNull(),
  reportFormat: reportFormatEnum('report_format').notNull(),
  status: reportStatusEnum('status').notNull().default('pending'),
  title: text('title').notNull(),
  description: text('description'),
  // Filters and parameters
  filters: json('filters').$type<Record<string, any>>().default({}),
  dateRange: json('date_range').$type<{
    startDate: string;
    endDate: string;
  }>(),
  // Results
  fileUrl: text('file_url'),
  fileSize: integer('file_size'), // in bytes
  data: json('data').$type<any>(), // For JSON format or cached data
  errorMessage: text('error_message'),
  // Metadata
  processingStartedAt: timestamp('processing_started_at', {
    withTimezone: true,
  }),
  processingCompletedAt: timestamp('processing_completed_at', {
    withTimezone: true,
  }),
  expiresAt: timestamp('expires_at', { withTimezone: true }), // Auto-delete old reports
  metadata: json('metadata').$type<Record<string, any>>().default({}),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Activity tracking for engagement analytics
export const activityLog = pgTable('activity_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull(),
  activityType: text('activity_type').notNull(), // login, test_start, test_submit, etc.
  entityType: text('entity_type'), // test, assignment, etc.
  entityId: uuid('entity_id'),
  metadata: json('metadata').$type<Record<string, any>>().default({}),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
