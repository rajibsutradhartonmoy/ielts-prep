export enum UserRole {
  ORGANIZATION_ADMIN = 'organization_admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
}

export enum SubscriptionTier {
  FREE = 'free',
  BASIC = 'basic',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

export enum SubscriptionStatus {
  TRIAL = 'trial',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  CANCELLED = 'cancelled',
}

export enum TestType {
  FULL_TEST = 'full_test',
  SPEAKING_ONLY = 'speaking_only',
  WRITING_ONLY = 'writing_only',
  LISTENING_ONLY = 'listening_only',
  READING_ONLY = 'reading_only',
}

export enum TestStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum TestAttemptStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  GRADED = 'graded',
  EXPIRED = 'expired',
}

export enum TestAssignmentType {
  INDIVIDUAL = 'individual',
  BATCH = 'batch',
}

export enum GradingQueueStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DISPUTED = 'disputed',
}

export enum GradingQueuePriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE_NOT_GIVEN = 'true_false_not_given',
  MATCHING = 'matching',
  FILL_BLANK = 'fill_blank',
  SHORT_ANSWER = 'short_answer',
  SENTENCE_COMPLETION = 'sentence_completion',
  SUMMARY_COMPLETION = 'summary_completion',
  DIAGRAM_LABELING = 'diagram_labeling',
  WRITING_TASK = 'writing_task',
  SPEAKING_TASK = 'speaking_task',
}

export enum SectionType {
  LISTENING = 'listening',
  READING = 'reading',
  WRITING = 'writing',
  SPEAKING = 'speaking',
}

export enum StudentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  GRADUATED = 'graduated',
  SUSPENDED = 'suspended',
}

export enum TeacherSpecialization {
  SPEAKING = 'speaking',
  WRITING = 'writing',
  BOTH = 'both',
}

export enum TeacherStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_LEAVE = 'on_leave',
}

export enum BatchStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}
