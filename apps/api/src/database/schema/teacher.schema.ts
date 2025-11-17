import { pgTable, uuid, varchar, text, timestamp, json, pgEnum, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './user.schema';
import { organizations } from './organization.schema';

export const teacherStatusEnum = pgEnum('teacher_status', ['active', 'inactive']);
export const teacherSpecializationEnum = pgEnum('teacher_specialization', ['speaking', 'writing', 'both']);

export const teachers = pgTable(
  'teachers',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    teacherCode: varchar('teacher_code', { length: 50 }).notNull(),
    phone: varchar('phone', { length: 50 }),
    specialization: teacherSpecializationEnum('specialization').notNull().default('both'),
    bio: text('bio'),
    qualifications: json('qualifications').$type<string[]>().default([]),
    status: teacherStatusEnum('status').notNull().default('active'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    orgCodeIdx: index('teachers_org_code_idx').on(table.organizationId, table.teacherCode),
    orgIdx: index('teachers_org_idx').on(table.organizationId),
  })
);

export const teachersRelations = relations(teachers, ({ one }) => ({
  user: one(users, {
    fields: [teachers.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [teachers.organizationId],
    references: [organizations.id],
  }),
}));
