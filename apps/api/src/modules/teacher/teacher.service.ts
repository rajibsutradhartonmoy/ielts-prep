import { Injectable, Inject, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { eq, and, desc, sql, ilike, or } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { DATABASE_CONNECTION, Database } from '@/database/database.module';
import * as schema from '@/database/schema';
import { CreateTeacherDto, UpdateTeacherDto, TeacherQueryDto } from './dto/teacher.dto';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class TeacherService {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: Database,
    private auditLogService: AuditLogService,
  ) {}

  private generateTeacherCode(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TCH-${timestamp}${random}`;
  }

  async createTeacher(organizationId: string, dto: CreateTeacherDto, createdBy: string) {
    // Check organization limits
    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.teachers)
      .where(eq(schema.teachers.organizationId, organizationId));

    const [org] = await this.db
      .select()
      .from(schema.organizations)
      .where(eq(schema.organizations.id, organizationId))
      .limit(1);

    if (Number(count) >= org.limits.maxTeachers) {
      throw new BadRequestException(`Teacher limit reached (${org.limits.maxTeachers}). Please upgrade your plan.`);
    }

    // Check if email already exists
    const [existingUser] = await this.db
      .select()
      .from(schema.users)
      .where(and(eq(schema.users.email, dto.email), eq(schema.users.organizationId, organizationId)))
      .limit(1);

    if (existingUser) {
      throw new ConflictException('Email already registered in this organization');
    }

    // Create user
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const [user] = await this.db
      .insert(schema.users)
      .values({
        organizationId,
        email: dto.email,
        passwordHash,
        name: dto.name,
        role: 'teacher',
      })
      .returning();

    const teacherCode = dto.teacherCode || this.generateTeacherCode();

    // Create teacher profile
    const [teacher] = await this.db
      .insert(schema.teachers)
      .values({
        userId: user.id,
        organizationId,
        teacherCode,
        phone: dto.phone,
        specialization: dto.specialization || 'both',
        bio: dto.bio,
        qualifications: dto.qualifications || [],
      })
      .returning();

    await this.auditLogService.log({
      organizationId,
      userId: createdBy,
      action: 'created',
      entityType: 'teacher',
      entityId: teacher.id,
      newValues: { email: user.email, name: user.name, teacherCode },
    });

    return {
      ...teacher,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async listTeachers(organizationId: string, query: TeacherQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    const conditions = [eq(schema.teachers.organizationId, organizationId)];

    if (query.status) {
      conditions.push(eq(schema.teachers.status, query.status));
    }

    if (query.specialization) {
      conditions.push(eq(schema.teachers.specialization, query.specialization));
    }

    let teachersQuery = this.db
      .select({
        teacher: schema.teachers,
        user: schema.users,
      })
      .from(schema.teachers)
      .innerJoin(schema.users, eq(schema.teachers.userId, schema.users.id))
      .where(and(...conditions));

    if (query.search) {
      teachersQuery = this.db
        .select({
          teacher: schema.teachers,
          user: schema.users,
        })
        .from(schema.teachers)
        .innerJoin(schema.users, eq(schema.teachers.userId, schema.users.id))
        .where(
          and(
            ...conditions,
            or(
              ilike(schema.users.name, `%${query.search}%`),
              ilike(schema.users.email, `%${query.search}%`),
              ilike(schema.teachers.teacherCode, `%${query.search}%`),
            ),
          ),
        );
    }

    const teachersData = await teachersQuery
      .orderBy(desc(schema.teachers.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.teachers)
      .where(and(...conditions));

    const formattedTeachers = teachersData.map(({ teacher, user }) => ({
      ...teacher,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    }));

    return {
      data: formattedTeachers,
      meta: {
        total: Number(count),
        page,
        limit,
        totalPages: Math.ceil(Number(count) / limit),
      },
    };
  }

  async getTeacher(id: string, organizationId: string) {
    const [result] = await this.db
      .select({
        teacher: schema.teachers,
        user: schema.users,
      })
      .from(schema.teachers)
      .innerJoin(schema.users, eq(schema.teachers.userId, schema.users.id))
      .where(and(eq(schema.teachers.id, id), eq(schema.teachers.organizationId, organizationId)))
      .limit(1);

    if (!result) {
      throw new NotFoundException('Teacher not found');
    }

    return {
      ...result.teacher,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        avatarUrl: result.user.avatarUrl,
        isActive: result.user.isActive,
      },
    };
  }

  async updateTeacher(id: string, organizationId: string, dto: UpdateTeacherDto, updatedBy: string) {
    const teacher = await this.getTeacher(id, organizationId);

    const updateData: any = { updatedAt: new Date() };

    if (dto.teacherCode) updateData.teacherCode = dto.teacherCode;
    if (dto.phone) updateData.phone = dto.phone;
    if (dto.specialization) updateData.specialization = dto.specialization;
    if (dto.bio !== undefined) updateData.bio = dto.bio;
    if (dto.qualifications) updateData.qualifications = dto.qualifications;
    if (dto.status) updateData.status = dto.status;

    await this.db.update(schema.teachers).set(updateData).where(eq(schema.teachers.id, id));

    if (dto.name) {
      await this.db
        .update(schema.users)
        .set({ name: dto.name, updatedAt: new Date() })
        .where(eq(schema.users.id, teacher.user.id));
    }

    await this.auditLogService.log({
      organizationId,
      userId: updatedBy,
      action: 'updated',
      entityType: 'teacher',
      entityId: id,
      oldValues: teacher,
      newValues: dto,
    });

    return this.getTeacher(id, organizationId);
  }

  async deleteTeacher(id: string, organizationId: string, deletedBy: string) {
    const teacher = await this.getTeacher(id, organizationId);

    await this.db
      .update(schema.teachers)
      .set({ deletedAt: new Date() })
      .where(eq(schema.teachers.id, id));

    await this.db
      .update(schema.users)
      .set({ deletedAt: new Date(), isActive: false })
      .where(eq(schema.users.id, teacher.user.id));

    await this.auditLogService.log({
      organizationId,
      userId: deletedBy,
      action: 'deleted',
      entityType: 'teacher',
      entityId: id,
    });

    return { message: 'Teacher deleted successfully' };
  }

  async getTeacherStats(id: string, organizationId: string) {
    await this.getTeacher(id, organizationId);

    // Get batch count
    const [{ batchCount }] = await this.db
      .select({ batchCount: sql<number>`count(*)` })
      .from(schema.batchTeachers)
      .where(eq(schema.batchTeachers.teacherId, id));

    return {
      totalBatches: Number(batchCount),
      pendingGradings: 0, // TODO: Implement when grading system is added
      testsGraded: 0,
      averageGradingTime: 0,
    };
  }

  async getTeacherWorkload(id: string, organizationId: string) {
    await this.getTeacher(id, organizationId);

    return {
      pendingSpeakingGradings: 0, // TODO: Implement
      pendingWritingGradings: 0,
      totalPending: 0,
    };
  }

  async assignToBatch(teacherId: string, batchId: string, organizationId: string) {
    await this.getTeacher(teacherId, organizationId);

    const [batch] = await this.db
      .select()
      .from(schema.batches)
      .where(and(eq(schema.batches.id, batchId), eq(schema.batches.organizationId, organizationId)))
      .limit(1);

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    const [existing] = await this.db
      .select()
      .from(schema.batchTeachers)
      .where(
        and(eq(schema.batchTeachers.batchId, batchId), eq(schema.batchTeachers.teacherId, teacherId)),
      )
      .limit(1);

    if (existing) {
      throw new ConflictException('Teacher already assigned to this batch');
    }

    const [assignment] = await this.db
      .insert(schema.batchTeachers)
      .values({ batchId, teacherId })
      .returning();

    return assignment;
  }

  async removeFromBatch(teacherId: string, batchId: string, organizationId: string) {
    await this.getTeacher(teacherId, organizationId);

    await this.db
      .delete(schema.batchTeachers)
      .where(
        and(eq(schema.batchTeachers.batchId, batchId), eq(schema.batchTeachers.teacherId, teacherId)),
      );

    return { message: 'Teacher removed from batch' };
  }
}
