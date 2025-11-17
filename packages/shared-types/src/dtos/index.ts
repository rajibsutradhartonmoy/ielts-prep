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
