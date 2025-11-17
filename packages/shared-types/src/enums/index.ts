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
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  GRADED = 'graded',
  EXPIRED = 'expired',
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  MATCHING = 'matching',
  FILL_BLANK = 'fill_blank',
  SHORT_ANSWER = 'short_answer',
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
