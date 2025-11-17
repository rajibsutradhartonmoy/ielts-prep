import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  json,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { organizations } from './organization.schema';
import { users } from './user.schema';

export const testTypeEnum = pgEnum('test_type', [
  'full_test',
  'speaking_only',
  'writing_only',
  'listening_only',
  'reading_only',
]);

export const testStatusEnum = pgEnum('test_status', [
  'draft',
  'published',
  'archived',
]);

export const sectionTypeEnum = pgEnum('section_type', [
  'listening',
  'reading',
  'writing',
  'speaking',
]);

export const questionTypeEnum = pgEnum('question_type', [
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
]);

export interface TestSettings {
  shuffleQuestions?: boolean;
  showTimer?: boolean;
  allowPause?: boolean;
  showProgressBar?: boolean;
  autoSubmitOnTimeout?: boolean;
  preventTabSwitch?: boolean;
  maxAttempts?: number;
}

export interface SectionInstructions {
  title: string;
  content: string;
  audioUrl?: string;
}

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
  isCorrect?: boolean;
}

export interface MatchingItem {
  id: string;
  left: string;
  right: string;
}

export interface QuestionGradingCriteria {
  maxScore: number;
  rubric?: string;
  sampleAnswer?: string;
  keywords?: string[];
  taskAchievement?: number;
  coherenceCohesion?: number;
  lexicalResource?: number;
  grammaticalRange?: number;
  fluencyCoherence?: number;
  pronunciation?: number;
}

export const tests = pgTable('tests', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  createdById: uuid('created_by_id')
    .notNull()
    .references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  type: testTypeEnum('type').notNull(),
  status: testStatusEnum('status').notNull().default('draft'),
  totalDuration: integer('total_duration').notNull(), // in minutes
  totalQuestions: integer('total_questions').notNull().default(0),
  passingScore: integer('passing_score'), // optional passing score
  instructions: text('instructions'),
  settings: json('settings').$type<TestSettings>().default({
    shuffleQuestions: false,
    showTimer: true,
    allowPause: false,
    showProgressBar: true,
    autoSubmitOnTimeout: true,
    preventTabSwitch: false,
    maxAttempts: 1,
  }),
  tags: json('tags').$type<string[]>().default([]),
  metadata: json('metadata').$type<Record<string, any>>().default({}),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const testSections = pgTable('test_sections', {
  id: uuid('id').defaultRandom().primaryKey(),
  testId: uuid('test_id')
    .notNull()
    .references(() => tests.id, { onDelete: 'cascade' }),
  type: sectionTypeEnum('type').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  instructions: json('instructions').$type<SectionInstructions>(),
  duration: integer('duration').notNull(), // in minutes
  orderIndex: integer('order_index').notNull(),
  totalQuestions: integer('total_questions').notNull().default(0),
  audioUrl: varchar('audio_url', { length: 500 }), // for listening sections
  passageText: text('passage_text'), // for reading sections
  imageUrl: varchar('image_url', { length: 500 }), // for diagrams
  metadata: json('metadata').$type<Record<string, any>>().default({}),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const questions = pgTable('questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  sectionId: uuid('section_id')
    .notNull()
    .references(() => testSections.id, { onDelete: 'cascade' }),
  type: questionTypeEnum('type').notNull(),
  questionText: text('question_text').notNull(),
  orderIndex: integer('order_index').notNull(),
  points: integer('points').notNull().default(1),
  // For multiple choice, true/false
  options: json('options').$type<QuestionOption[]>(),
  // For matching questions
  matchingItems: json('matching_items').$type<MatchingItem[]>(),
  // For fill in blank, short answer
  correctAnswer: text('correct_answer'),
  // For answers with multiple acceptable variations
  acceptableAnswers: json('acceptable_answers').$type<string[]>(),
  // For case-sensitive matching
  caseSensitive: boolean('case_sensitive').default(false),
  // Instructions specific to this question
  questionInstructions: text('question_instructions'),
  // For writing/speaking tasks
  gradingCriteria: json('grading_criteria').$type<QuestionGradingCriteria>(),
  // Media attachments
  imageUrl: varchar('image_url', { length: 500 }),
  audioUrl: varchar('audio_url', { length: 500 }),
  // Additional metadata
  explanation: text('explanation'), // Explanation for the correct answer
  hints: json('hints').$type<string[]>(),
  metadata: json('metadata').$type<Record<string, any>>().default({}),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Store media files associated with tests
export const testMedia = pgTable('test_media', {
  id: uuid('id').defaultRandom().primaryKey(),
  testId: uuid('test_id')
    .notNull()
    .references(() => tests.id, { onDelete: 'cascade' }),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileType: varchar('file_type', { length: 50 }).notNull(), // audio, image, document
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  fileSize: integer('file_size').notNull(), // in bytes
  url: varchar('url', { length: 500 }).notNull(),
  duration: integer('duration'), // for audio/video in seconds
  description: text('description'),
  metadata: json('metadata').$type<Record<string, any>>().default({}),
  uploadedById: uuid('uploaded_by_id')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
