import {
  UserRole,
  SubscriptionTier,
  SubscriptionStatus,
  StudentStatus,
  TeacherSpecialization,
  TeacherStatus,
  BatchStatus,
  TestType,
  TestStatus,
  SectionType,
  QuestionType,
} from '../enums';

export interface User {
  id: string;
  organizationId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  isActive: boolean;
  emailVerifiedAt?: Date;
  lastLoginAt?: Date;
  preferences?: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  language?: string;
  theme?: 'light' | 'dark' | 'system';
  notifications?: {
    email?: boolean;
    push?: boolean;
  };
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  address?: OrganizationAddress;
  isActive: boolean;
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt?: Date;
  subscriptionStartsAt?: Date;
  subscriptionEndsAt?: Date;
  limits: OrganizationLimits;
  settings: OrganizationSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
}

export interface OrganizationLimits {
  maxStudents: number;
  maxTeachers: number;
  maxTestsPerMonth: number;
  maxStorageGb: number;
}

export interface OrganizationSettings {
  timezone: string;
  language: string;
  dateFormat: string;
  featuresEnabled: string[];
}

export interface OrganizationBranding {
  id: string;
  organizationId: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  customCss?: string;
  emailHeaderLogoUrl?: string;
  emailFooterText?: string;
}

export interface AuditLog {
  id: string;
  organizationId?: string;
  userId?: string;
  systemAdminId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// Phase 2: User Management Types

export interface StudentAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
}

export interface EmergencyContact {
  name?: string;
  relationship?: string;
  phone?: string;
  email?: string;
}

export interface Student {
  id: string;
  userId: string;
  organizationId: string;
  studentCode: string;
  dateOfBirth?: Date;
  phone?: string;
  address?: StudentAddress;
  emergencyContact?: EmergencyContact;
  enrollmentDate: Date;
  status: StudentStatus;
  notes?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  user?: User;
}

export interface Teacher {
  id: string;
  userId: string;
  organizationId: string;
  teacherCode: string;
  specialization: TeacherSpecialization;
  bio?: string;
  qualifications?: string[];
  yearsOfExperience?: number;
  maxStudents?: number;
  status: TeacherStatus;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  user?: User;
}

export interface Batch {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  maxStudents?: number;
  status: BatchStatus;
  settings?: BatchSettings;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  students?: Student[];
  teachers?: Teacher[];
}

export interface BatchSettings {
  allowLateJoining?: boolean;
  autoCompleteOnEndDate?: boolean;
  notifyOnChanges?: boolean;
}

export interface BatchStudent {
  batchId: string;
  studentId: string;
  joinedAt: Date;
  leftAt?: Date;
  isActive: boolean;
}

export interface BatchTeacher {
  batchId: string;
  teacherId: string;
  assignedAt: Date;
  removedAt?: Date;
  isActive: boolean;
}

// Phase 3: Test Management Types

export interface TestSettings {
  shuffleQuestions?: boolean;
  showTimer?: boolean;
  allowPause?: boolean;
  showProgressBar?: boolean;
  autoSubmitOnTimeout?: boolean;
  preventTabSwitch?: boolean;
  maxAttempts?: number;
}

export interface Test {
  id: string;
  organizationId: string;
  createdById: string;
  title: string;
  description?: string;
  type: TestType;
  status: TestStatus;
  totalDuration: number;
  totalQuestions: number;
  passingScore?: number;
  instructions?: string;
  settings: TestSettings;
  tags: string[];
  metadata?: Record<string, any>;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  sections?: TestSection[];
}

export interface SectionInstructions {
  title: string;
  content: string;
  audioUrl?: string;
}

export interface TestSection {
  id: string;
  testId: string;
  type: SectionType;
  title: string;
  instructions?: SectionInstructions;
  duration: number;
  orderIndex: number;
  totalQuestions: number;
  audioUrl?: string;
  passageText?: string;
  imageUrl?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  questions?: Question[];
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

export interface Question {
  id: string;
  sectionId: string;
  type: QuestionType;
  questionText: string;
  orderIndex: number;
  points: number;
  options?: QuestionOption[];
  matchingItems?: MatchingItem[];
  correctAnswer?: string;
  acceptableAnswers?: string[];
  caseSensitive?: boolean;
  questionInstructions?: string;
  gradingCriteria?: QuestionGradingCriteria;
  imageUrl?: string;
  audioUrl?: string;
  explanation?: string;
  hints?: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestMedia {
  id: string;
  testId: string;
  fileName: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  url: string;
  duration?: number;
  description?: string;
  metadata?: Record<string, any>;
  uploadedById: string;
  createdAt: Date;
}
