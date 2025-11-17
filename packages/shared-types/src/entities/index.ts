import { UserRole, SubscriptionTier, SubscriptionStatus } from '../enums';

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
