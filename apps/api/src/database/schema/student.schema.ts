import { pgTable, uuid, varchar, text, date, timestamp, json, pgEnum, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './user.schema';
import { organizations } from './organization.schema';

export const studentStatusEnum = pgEnum('student_status', ['active', 'inactive', 'suspended']);

export interface StudentAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export const students = pgTable(
  'students',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    studentCode: varchar('student_code', { length: 50 }).notNull(),
    dateOfBirth: date('date_of_birth'),
    phone: varchar('phone', { length: 50 }),
    address: json('address').$type<StudentAddress>(),
    emergencyContact: json('emergency_contact').$type<EmergencyContact>(),
    enrollmentDate: date('enrollment_date').notNull().defaultNow(),
    status: studentStatusEnum('status').notNull().default('active'),
    notes: text('notes'),
    metadata: json('metadata').$type<Record<string, any>>().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    orgCodeIdx: index('students_org_code_idx').on(table.organizationId, table.studentCode),
    orgIdx: index('students_org_idx').on(table.organizationId),
  })
);

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, {
    fields: [students.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [students.organizationId],
    references: [organizations.id],
  }),
}));
