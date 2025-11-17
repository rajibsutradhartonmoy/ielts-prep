import { pgTable, uuid, varchar, text, date, timestamp, pgEnum, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizations } from './organization.schema';
import { users } from './user.schema';
import { students } from './student.schema';
import { teachers } from './teacher.schema';

export const batchStatusEnum = pgEnum('batch_status', ['active', 'completed', 'archived']);

export const batches = pgTable('batches', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  status: batchStatusEnum('status').notNull().default('active'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const batchStudents = pgTable(
  'batch_students',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    batchId: uuid('batch_id')
      .notNull()
      .references(() => batches.id, { onDelete: 'cascade' }),
    studentId: uuid('student_id')
      .notNull()
      .references(() => students.id, { onDelete: 'cascade' }),
    enrolledAt: timestamp('enrolled_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    batchStudentUnique: uniqueIndex('batch_student_unique_idx').on(table.batchId, table.studentId),
  })
);

export const batchTeachers = pgTable(
  'batch_teachers',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    batchId: uuid('batch_id')
      .notNull()
      .references(() => batches.id, { onDelete: 'cascade' }),
    teacherId: uuid('teacher_id')
      .notNull()
      .references(() => teachers.id, { onDelete: 'cascade' }),
    assignedAt: timestamp('assigned_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    batchTeacherUnique: uniqueIndex('batch_teacher_unique_idx').on(table.batchId, table.teacherId),
  })
);

export const batchesRelations = relations(batches, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [batches.organizationId],
    references: [organizations.id],
  }),
  createdByUser: one(users, {
    fields: [batches.createdBy],
    references: [users.id],
  }),
  batchStudents: many(batchStudents),
  batchTeachers: many(batchTeachers),
}));

export const batchStudentsRelations = relations(batchStudents, ({ one }) => ({
  batch: one(batches, {
    fields: [batchStudents.batchId],
    references: [batches.id],
  }),
  student: one(students, {
    fields: [batchStudents.studentId],
    references: [students.id],
  }),
}));

export const batchTeachersRelations = relations(batchTeachers, ({ one }) => ({
  batch: one(batches, {
    fields: [batchTeachers.batchId],
    references: [batches.id],
  }),
  teacher: one(teachers, {
    fields: [batchTeachers.teacherId],
    references: [teachers.id],
  }),
}));
