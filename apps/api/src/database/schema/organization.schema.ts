import { pgTable, uuid, varchar, text, boolean, timestamp, json, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { systemAdmins } from './system-admin.schema';
import { users } from './user.schema';

export const subscriptionTierEnum = pgEnum('subscription_tier', ['free', 'basic', 'premium', 'enterprise']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['trial', 'active', 'suspended', 'cancelled']);

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

export const organizations = pgTable('organizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 50 }),
  address: json('address').$type<OrganizationAddress>(),
  isActive: boolean('is_active').notNull().default(true),
  subscriptionTier: subscriptionTierEnum('subscription_tier').notNull().default('free'),
  subscriptionStatus: subscriptionStatusEnum('subscription_status').notNull().default('trial'),
  trialEndsAt: timestamp('trial_ends_at', { withTimezone: true }),
  subscriptionStartsAt: timestamp('subscription_starts_at', { withTimezone: true }),
  subscriptionEndsAt: timestamp('subscription_ends_at', { withTimezone: true }),
  limits: json('limits').$type<OrganizationLimits>().notNull().default({
    maxStudents: 10,
    maxTeachers: 2,
    maxTestsPerMonth: 50,
    maxStorageGb: 1,
  }),
  settings: json('settings').$type<OrganizationSettings>().notNull().default({
    timezone: 'UTC',
    language: 'en',
    dateFormat: 'YYYY-MM-DD',
    featuresEnabled: [],
  }),
  createdBy: uuid('created_by').references(() => systemAdmins.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const organizationBranding = pgTable('organization_branding', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id')
    .notNull()
    .unique()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  logoUrl: text('logo_url'),
  faviconUrl: text('favicon_url'),
  primaryColor: varchar('primary_color', { length: 20 }).default('#3B82F6'),
  secondaryColor: varchar('secondary_color', { length: 20 }).default('#6B7280'),
  accentColor: varchar('accent_color', { length: 20 }).default('#10B981'),
  fontFamily: varchar('font_family', { length: 255 }).default('Inter'),
  customCss: text('custom_css'),
  emailHeaderLogoUrl: text('email_header_logo_url'),
  emailFooterText: text('email_footer_text'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const organizationDomains = pgTable('organization_domains', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  domain: varchar('domain', { length: 255 }).notNull().unique(),
  isPrimary: boolean('is_primary').notNull().default(false),
  isVerified: boolean('is_verified').notNull().default(false),
  verificationToken: varchar('verification_token', { length: 255 }),
  sslStatus: varchar('ssl_status', { length: 50 }).default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const organizationsRelations = relations(organizations, ({ one, many }) => ({
  createdByAdmin: one(systemAdmins, {
    fields: [organizations.createdBy],
    references: [systemAdmins.id],
  }),
  branding: one(organizationBranding),
  domains: many(organizationDomains),
  users: many(users),
}));

export const organizationBrandingRelations = relations(organizationBranding, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationBranding.organizationId],
    references: [organizations.id],
  }),
}));

export const organizationDomainsRelations = relations(organizationDomains, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationDomains.organizationId],
    references: [organizations.id],
  }),
}));
