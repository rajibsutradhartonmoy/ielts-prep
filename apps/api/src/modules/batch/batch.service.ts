import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, and, desc, sql, ilike } from 'drizzle-orm';
import { DATABASE_CONNECTION, Database } from '@/database/database.module';
import * as schema from '@/database/schema';
import { CreateBatchDto, UpdateBatchDto, BatchQueryDto } from './dto/batch.dto';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class BatchService {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: Database,
    private auditLogService: AuditLogService,
  ) {}

  async createBatch(organizationId: string, dto: CreateBatchDto, createdBy: string) {
    const [batch] = await this.db
      .insert(schema.batches)
      .values({
        organizationId,
        name: dto.name,
        description: dto.description,
        startDate: dto.startDate,
        endDate: dto.endDate,
        createdBy,
      })
      .returning();

    await this.auditLogService.log({
      organizationId,
      userId: createdBy,
      action: 'created',
      entityType: 'batch',
      entityId: batch.id,
      newValues: { name: batch.name },
    });

    return batch;
  }

  async listBatches(organizationId: string, query: BatchQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    const conditions = [eq(schema.batches.organizationId, organizationId)];

    if (query.status) {
      conditions.push(eq(schema.batches.status, query.status));
    }

    let batchesQuery = this.db
      .select()
      .from(schema.batches)
      .where(and(...conditions));

    if (query.search) {
      batchesQuery = this.db
        .select()
        .from(schema.batches)
        .where(and(...conditions, ilike(schema.batches.name, `%${query.search}%`)));
    }

    const batchesData = await batchesQuery
      .orderBy(desc(schema.batches.createdAt))
      .limit(limit)
      .offset(offset);

    // Get student and teacher counts for each batch
    const batchesWithCounts = await Promise.all(
      batchesData.map(async (batch) => {
        const [{ studentCount }] = await this.db
          .select({ studentCount: sql<number>`count(*)` })
          .from(schema.batchStudents)
          .where(eq(schema.batchStudents.batchId, batch.id));

        const [{ teacherCount }] = await this.db
          .select({ teacherCount: sql<number>`count(*)` })
          .from(schema.batchTeachers)
          .where(eq(schema.batchTeachers.batchId, batch.id));

        return {
          ...batch,
          studentCount: Number(studentCount),
          teacherCount: Number(teacherCount),
        };
      }),
    );

    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.batches)
      .where(and(...conditions));

    return {
      data: batchesWithCounts,
      meta: {
        total: Number(count),
        page,
        limit,
        totalPages: Math.ceil(Number(count) / limit),
      },
    };
  }

  async getBatch(id: string, organizationId: string) {
    const [batch] = await this.db
      .select()
      .from(schema.batches)
      .where(and(eq(schema.batches.id, id), eq(schema.batches.organizationId, organizationId)))
      .limit(1);

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    // Get students in batch
    const batchStudentsData = await this.db
      .select({
        batchStudent: schema.batchStudents,
        student: schema.students,
        user: schema.users,
      })
      .from(schema.batchStudents)
      .innerJoin(schema.students, eq(schema.batchStudents.studentId, schema.students.id))
      .innerJoin(schema.users, eq(schema.students.userId, schema.users.id))
      .where(eq(schema.batchStudents.batchId, id));

    // Get teachers in batch
    const batchTeachersData = await this.db
      .select({
        batchTeacher: schema.batchTeachers,
        teacher: schema.teachers,
        user: schema.users,
      })
      .from(schema.batchTeachers)
      .innerJoin(schema.teachers, eq(schema.batchTeachers.teacherId, schema.teachers.id))
      .innerJoin(schema.users, eq(schema.teachers.userId, schema.users.id))
      .where(eq(schema.batchTeachers.batchId, id));

    return {
      ...batch,
      students: batchStudentsData.map(({ student, user, batchStudent }) => ({
        id: student.id,
        studentCode: student.studentCode,
        enrolledAt: batchStudent.enrolledAt,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      })),
      teachers: batchTeachersData.map(({ teacher, user, batchTeacher }) => ({
        id: teacher.id,
        teacherCode: teacher.teacherCode,
        specialization: teacher.specialization,
        assignedAt: batchTeacher.assignedAt,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      })),
    };
  }

  async updateBatch(id: string, organizationId: string, dto: UpdateBatchDto, updatedBy: string) {
    const batch = await this.getBatch(id, organizationId);

    const updateData: any = { updatedAt: new Date() };
    if (dto.name) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.startDate) updateData.startDate = dto.startDate;
    if (dto.endDate !== undefined) updateData.endDate = dto.endDate;
    if (dto.status) updateData.status = dto.status;

    const [updated] = await this.db
      .update(schema.batches)
      .set(updateData)
      .where(eq(schema.batches.id, id))
      .returning();

    await this.auditLogService.log({
      organizationId,
      userId: updatedBy,
      action: 'updated',
      entityType: 'batch',
      entityId: id,
      oldValues: batch,
      newValues: dto,
    });

    return this.getBatch(id, organizationId);
  }

  async deleteBatch(id: string, organizationId: string, deletedBy: string) {
    await this.getBatch(id, organizationId);

    await this.db
      .update(schema.batches)
      .set({ deletedAt: new Date() })
      .where(eq(schema.batches.id, id));

    await this.auditLogService.log({
      organizationId,
      userId: deletedBy,
      action: 'deleted',
      entityType: 'batch',
      entityId: id,
    });

    return { message: 'Batch deleted successfully' };
  }

  async addStudentsToBatch(batchId: string, studentIds: string[], organizationId: string) {
    await this.getBatch(batchId, organizationId);

    const results = [];
    for (const studentId of studentIds) {
      try {
        const [assignment] = await this.db
          .insert(schema.batchStudents)
          .values({ batchId, studentId })
          .onConflictDoNothing()
          .returning();
        if (assignment) {
          results.push({ studentId, success: true });
        } else {
          results.push({ studentId, success: false, reason: 'Already assigned' });
        }
      } catch (error) {
        results.push({ studentId, success: false, reason: error.message });
      }
    }

    return results;
  }

  async removeStudentsFromBatch(batchId: string, studentIds: string[], organizationId: string) {
    await this.getBatch(batchId, organizationId);

    for (const studentId of studentIds) {
      await this.db
        .delete(schema.batchStudents)
        .where(
          and(
            eq(schema.batchStudents.batchId, batchId),
            eq(schema.batchStudents.studentId, studentId),
          ),
        );
    }

    return { message: 'Students removed from batch' };
  }

  async addTeachersToBatch(batchId: string, teacherIds: string[], organizationId: string) {
    await this.getBatch(batchId, organizationId);

    const results = [];
    for (const teacherId of teacherIds) {
      try {
        const [assignment] = await this.db
          .insert(schema.batchTeachers)
          .values({ batchId, teacherId })
          .onConflictDoNothing()
          .returning();
        if (assignment) {
          results.push({ teacherId, success: true });
        } else {
          results.push({ teacherId, success: false, reason: 'Already assigned' });
        }
      } catch (error) {
        results.push({ teacherId, success: false, reason: error.message });
      }
    }

    return results;
  }

  async removeTeachersFromBatch(batchId: string, teacherIds: string[], organizationId: string) {
    await this.getBatch(batchId, organizationId);

    for (const teacherId of teacherIds) {
      await this.db
        .delete(schema.batchTeachers)
        .where(
          and(
            eq(schema.batchTeachers.batchId, batchId),
            eq(schema.batchTeachers.teacherId, teacherId),
          ),
        );
    }

    return { message: 'Teachers removed from batch' };
  }

  async getBatchStats(id: string, organizationId: string) {
    const batch = await this.getBatch(id, organizationId);

    return {
      studentCount: batch.students.length,
      teacherCount: batch.teachers.length,
      averagePerformance: 0, // TODO: Implement when tests are added
      completionRate: 0,
    };
  }

  async archiveBatch(id: string, organizationId: string, archivedBy: string) {
    await this.getBatch(id, organizationId);

    const [updated] = await this.db
      .update(schema.batches)
      .set({ status: 'archived', updatedAt: new Date() })
      .where(eq(schema.batches.id, id))
      .returning();

    await this.auditLogService.log({
      organizationId,
      userId: archivedBy,
      action: 'archived',
      entityType: 'batch',
      entityId: id,
    });

    return updated;
  }
}
