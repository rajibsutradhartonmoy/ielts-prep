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
  TestAttemptStatus,
  TestAssignmentType,
  SectionType,
  QuestionType,
  GradingQueueStatus,
  GradingQueuePriority,
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

// Phase 4: Test Assignment & Student Test Taking Types

export interface TestAssignmentSettings {
  allowLateSubmission?: boolean;
  showResultsImmediately?: boolean;
  showCorrectAnswers?: boolean;
  sendEmailNotification?: boolean;
}

export interface TestAssignment {
  id: string;
  organizationId: string;
  testId: string;
  assignmentType: TestAssignmentType;
  studentId?: string;
  batchId?: string;
  assignedById: string;
  startDate: Date;
  dueDate: Date;
  settings: TestAssignmentSettings;
  instructions?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentAnswer {
  questionId: string;
  answer: any;
  timeSpent?: number;
  flagged?: boolean;
}

export interface AttemptMetrics {
  totalTimeSpent: number;
  questionsAnswered: number;
  questionsFlagged: number;
  sectionTimes: Record<string, number>;
  tabSwitches?: number;
  pauseCount?: number;
}

export interface TestAttempt {
  id: string;
  assignmentId: string;
  studentId: string;
  testId: string;
  attemptNumber: number;
  status: TestAttemptStatus;
  startedAt?: Date;
  submittedAt?: Date;
  completedAt?: Date;
  answers: StudentAnswer[];
  currentSectionIndex: number;
  currentQuestionIndex: number;
  timeRemaining?: number;
  metrics?: AttemptMetrics;
  rawScore?: number;
  maxScore?: number;
  percentageScore?: number;
  bandScore?: number;
  isPassed?: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionResponse {
  id: string;
  attemptId: string;
  questionId: string;
  sectionId: string;
  studentAnswer: any;
  isCorrect?: boolean;
  pointsEarned?: number;
  maxPoints: number;
  timeSpent?: number;
  flagged: boolean;
  needsManualGrading: boolean;
  gradedById?: string;
  gradedAt?: Date;
  feedback?: string;
  detailedScores?: Record<string, number>;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Phase 5: Grading System Types

export interface GradingQueueItem {
  id: string;
  organizationId: string;
  attemptId: string;
  responseId: string;
  assignedTeacherId?: string;
  status: GradingQueueStatus;
  priority: GradingQueuePriority;
  questionType: string;
  dueDate?: Date;
  startedAt?: Date;
  completedAt?: Date;
  estimatedTime?: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface WritingScores {
  taskAchievement: number;
  coherenceCohesion: number;
  lexicalResource: number;
  grammaticalRangeAccuracy: number;
  overallBand: number;
}

export interface SpeakingScores {
  fluencyCoherence: number;
  lexicalResource: number;
  grammaticalRangeAccuracy: number;
  pronunciation: number;
  overallBand: number;
}

export interface SpecificComment {
  section: string;
  comment: string;
  suggestion?: string;
}

export interface GradingFeedback {
  id: string;
  responseId: string;
  teacherId: string;
  writingScores?: WritingScores;
  speakingScores?: SpeakingScores;
  overallFeedback: string;
  strengthsHighlighted: string[];
  areasForImprovement: string[];
  specificComments: SpecificComment[];
  audioFeedbackUrl?: string;
  annotatedResponse?: string;
  timeSpentGrading?: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeedbackTemplate {
  id: string;
  organizationId: string;
  teacherId?: string;
  name: string;
  category: string;
  templateText: string;
  isGlobal: boolean;
  usageCount: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeacherGradingStats {
  id: string;
  teacherId: string;
  totalGraded: number;
  writingTasksGraded: number;
  speakingTasksGraded: number;
  averageTimePerGrading?: number;
  averageScoreGiven?: number;
  lastGradedAt?: Date;
  currentQueueSize: number;
  metadata?: Record<string, any>;
  updatedAt: Date;
}

// Phase 6: Analytics, Reports & Organization Customization Types

export interface StudentAnalytics {
  id: string;
  studentId: string;
  organizationId: string;
  totalTestsTaken: number;
  totalTestsPassed: number;
  averageBandScore?: number;
  bestBandScore?: number;
  listeningAvgScore?: number;
  readingAvgScore?: number;
  writingAvgScore?: number;
  speakingAvgScore?: number;
  totalTimeSpent?: number;
  averageTimePerTest?: number;
  scoreImprovement?: number;
  weakAreas: string[];
  strongAreas: string[];
  lastTestDate?: Date;
  testsThisMonth: number;
  testsThisWeek: number;
  metadata?: Record<string, any>;
  updatedAt: Date;
}

export interface TestAnalytics {
  id: string;
  testId: string;
  organizationId: string;
  totalAttempts: number;
  completedAttempts: number;
  averageScore?: number;
  averageBandScore?: number;
  passRate?: number;
  averageCompletionTime?: number;
  difficultyRating?: number;
  questionsWithLowAccuracy?: Array<{ questionId: string; accuracy: number }>;
  scoreDistribution?: Record<string, number>;
  metadata?: Record<string, any>;
  updatedAt: Date;
}

export interface OrganizationAnalytics {
  id: string;
  organizationId: string;
  totalStudents: number;
  activeStudents: number;
  totalTeachers: number;
  totalBatches: number;
  totalTests: number;
  publishedTests: number;
  totalAttempts: number;
  completedAttempts: number;
  overallPassRate?: number;
  averageBandScore?: number;
  studentEngagementRate?: number;
  testsCreatedThisMonth: number;
  testsAssignedThisMonth: number;
  activeStudentsThisMonth: number;
  storageUsedMb: number;
  metadata?: Record<string, any>;
  updatedAt: Date;
}

export interface GeneratedReport {
  id: string;
  organizationId: string;
  generatedById: string;
  reportType: string;
  reportFormat: string;
  status: string;
  title: string;
  description?: string;
  filters?: Record<string, any>;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  fileUrl?: string;
  fileSize?: number;
  data?: any;
  errorMessage?: string;
  processingStartedAt?: Date;
  processingCompletedAt?: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
