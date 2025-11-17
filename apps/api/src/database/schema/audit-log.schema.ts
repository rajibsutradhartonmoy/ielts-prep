import { pgTable, uuid, varchar, text, timestamp, json, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizations } from './organization.schema';
import { users } from './user.schema';
import { systemAdmins } from './system-admin.schema';

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'set null' }),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    systemAdminId: uuid('system_admin_id').references(() => systemAdmins.id, { onDelete: 'set null' }),
    action: varchar('action', { length: 50 }).notNull(), // created, updated, deleted, login, etc.
    entityType: varchar('entity_type', { length: 50 }).notNull(), // test, student, organization, etc.
    entityId: uuid('entity_id'),
    oldValues: json('old_values'),
    newValues: json('new_values'),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    orgCreatedAtIdx: index('audit_logs_org_created_at_idx').on(table.organizationId, table.createdAt),
    userIdx: index('audit_logs_user_idx').on(table.userId),
    entityIdx: index('audit_logs_entity_idx').on(table.entityType, table.entityId),
    actionIdx: index('audit_logs_action_idx').on(table.action),
  })
);

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  organization: one(organizations, {
    fields: [auditLogs.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
  systemAdmin: one(systemAdmins, {
    fields: [auditLogs.systemAdminId],
    references: [systemAdmins.id],
  }),
}));
