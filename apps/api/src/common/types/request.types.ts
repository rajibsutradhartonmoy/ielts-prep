import { Request } from 'express';

export interface UserPayload {
  sub: string;
  id: string;
  email: string;
  role: string;
  organizationId: string;
  studentId?: string;
  teacherId?: string;
}

export interface AuthenticatedRequest extends Request {
  user: UserPayload;
}

export interface TenantRequest extends Request {
  tenantId?: string;
  tenantSlug?: string;
}

export interface AuthenticatedTenantRequest extends AuthenticatedRequest {
  tenantId?: string;
  tenantSlug?: string;
}
