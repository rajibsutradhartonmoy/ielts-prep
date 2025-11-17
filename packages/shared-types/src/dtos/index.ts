export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
  organizationId: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterUserRequest {
  email: string;
  password: string;
  name: string;
  organizationId: string;
  role: 'organization_admin' | 'teacher' | 'student';
}

// Phase 2: User Management DTOs

export interface CreateStudentRequest {
  email: string;
  password: string;
  name: string;
  dateOfBirth?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
  };
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
    email?: string;
  };
}

export interface UpdateStudentRequest {
  name?: string;
  dateOfBirth?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
  };
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
    email?: string;
  };
  status?: 'active' | 'inactive' | 'graduated' | 'suspended';
  notes?: string;
}

export interface BulkCreateStudentsRequest {
  students: CreateStudentRequest[];
}

export interface BulkCreateResult<T> {
  successful: Array<{ index: number; success: true; data: T }>;
  failed: Array<{ index: number; success: false; email: string; error: string }>;
}

export interface CreateTeacherRequest {
  email: string;
  password: string;
  name: string;
  specialization: 'speaking' | 'writing' | 'both';
  bio?: string;
  qualifications?: string[];
  yearsOfExperience?: number;
  maxStudents?: number;
}

export interface UpdateTeacherRequest {
  name?: string;
  specialization?: 'speaking' | 'writing' | 'both';
  bio?: string;
  qualifications?: string[];
  yearsOfExperience?: number;
  maxStudents?: number;
  status?: 'active' | 'inactive' | 'on_leave';
}

export interface CreateBatchRequest {
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  maxStudents?: number;
  settings?: {
    allowLateJoining?: boolean;
    autoCompleteOnEndDate?: boolean;
    notifyOnChanges?: boolean;
  };
}

export interface UpdateBatchRequest {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  maxStudents?: number;
  status?: 'active' | 'completed' | 'cancelled';
  settings?: {
    allowLateJoining?: boolean;
    autoCompleteOnEndDate?: boolean;
    notifyOnChanges?: boolean;
  };
}

export interface AssignStudentsToBatchRequest {
  studentIds: string[];
}

export interface AssignTeachersToBatchRequest {
  teacherIds: string[];
}

// Phase 3: Test Management DTOs

export interface TestSettingsRequest {
  shuffleQuestions?: boolean;
  showTimer?: boolean;
  allowPause?: boolean;
  showProgressBar?: boolean;
  autoSubmitOnTimeout?: boolean;
  preventTabSwitch?: boolean;
  maxAttempts?: number;
}

export interface CreateTestRequest {
  title: string;
  description?: string;
  type: 'full_test' | 'speaking_only' | 'writing_only' | 'listening_only' | 'reading_only';
  totalDuration: number;
  passingScore?: number;
  instructions?: string;
  settings?: TestSettingsRequest;
  tags?: string[];
}

export interface UpdateTestRequest {
  title?: string;
  description?: string;
  status?: 'draft' | 'published' | 'archived';
  totalDuration?: number;
  passingScore?: number;
  instructions?: string;
  settings?: TestSettingsRequest;
  tags?: string[];
}

export interface SectionInstructionsRequest {
  title: string;
  content: string;
  audioUrl?: string;
}

export interface CreateSectionRequest {
  type: 'listening' | 'reading' | 'writing' | 'speaking';
  title: string;
  instructions?: SectionInstructionsRequest;
  duration: number;
  orderIndex: number;
  audioUrl?: string;
  passageText?: string;
  imageUrl?: string;
}

export interface UpdateSectionRequest {
  title?: string;
  instructions?: SectionInstructionsRequest;
  duration?: number;
  orderIndex?: number;
  audioUrl?: string;
  passageText?: string;
  imageUrl?: string;
}

export interface QuestionOptionRequest {
  id: string;
  label: string;
  value: string;
  isCorrect?: boolean;
}

export interface MatchingItemRequest {
  id: string;
  left: string;
  right: string;
}

export interface GradingCriteriaRequest {
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

export interface CreateQuestionRequest {
  type:
    | 'multiple_choice'
    | 'true_false_not_given'
    | 'matching'
    | 'fill_blank'
    | 'short_answer'
    | 'sentence_completion'
    | 'summary_completion'
    | 'diagram_labeling'
    | 'writing_task'
    | 'speaking_task';
  questionText: string;
  orderIndex: number;
  points?: number;
  options?: QuestionOptionRequest[];
  matchingItems?: MatchingItemRequest[];
  correctAnswer?: string;
  acceptableAnswers?: string[];
  caseSensitive?: boolean;
  questionInstructions?: string;
  gradingCriteria?: GradingCriteriaRequest;
  imageUrl?: string;
  audioUrl?: string;
  explanation?: string;
  hints?: string[];
}

export interface UpdateQuestionRequest {
  questionText?: string;
  orderIndex?: number;
  points?: number;
  options?: QuestionOptionRequest[];
  matchingItems?: MatchingItemRequest[];
  correctAnswer?: string;
  acceptableAnswers?: string[];
  caseSensitive?: boolean;
  questionInstructions?: string;
  gradingCriteria?: GradingCriteriaRequest;
  imageUrl?: string;
  audioUrl?: string;
  explanation?: string;
  hints?: string[];
}

export interface CloneTestRequest {
  newTitle?: string;
  includeSections?: boolean;
  includeQuestions?: boolean;
}

export interface ReorderQuestionsRequest {
  questions: Array<{ id: string; orderIndex: number }>;
}
