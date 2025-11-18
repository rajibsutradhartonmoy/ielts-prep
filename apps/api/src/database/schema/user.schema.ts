import { pgTable, uuid, varchar, text, boolean, timestamp, json, pgEnum, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizations } from './organization.schema';

export const userRoleEnum = pgEnum('user_role', ['organization_admin', 'teacher', 'student']);

export interface UserPreferences {
  language?: string;
  theme?: 'light' | 'dark' | 'system';
  notifications?: {
    email?: boolean;
    push?: boolean;
  };
}

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    email: varchar('email', { length: 255 }).notNull(),
    passwordHash: text('password_hash').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    avatarUrl: text('avatar_url'),
    role: userRoleEnum('role').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),
    emailVerificationToken: varchar('email_verification_token', { length: 255 }),
    emailVerificationExpires: timestamp('email_verification_expires', { withTimezone: true }),
    passwordResetToken: varchar('password_reset_token', { length: 255 }),
    passwordResetExpires: timestamp('password_reset_expires', { withTimezone: true }),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    preferences: json('preferences').$type<UserPreferences>().default({
      language: 'en',
      theme: 'system',
      notifications: { email: true, push: false },
    }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    // Unique email per organization (soft-delete aware)
    orgEmailUnique: uniqueIndex('users_org_email_unique').on(
      table.organizationId,
      table.email
    ),
  })
);

export const usersRelations = relations(users, ({ one }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
}));
