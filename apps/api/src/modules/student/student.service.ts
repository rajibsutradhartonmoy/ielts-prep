import { Injectable, Inject, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { eq, and, desc, sql, ilike, or } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { DATABASE_CONNECTION, Database } from '@/database/database.module';
import * as schema from '@/database/schema';
import { CreateStudentDto, UpdateStudentDto, StudentQueryDto } from './dto/student.dto';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class StudentService {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: Database,
    private auditLogService: AuditLogService,
  ) {}

  private generateStudentCode(orgId: string): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `STU-${timestamp}${random}`;
  }

  async createStudent(organizationId: string, dto: CreateStudentDto, createdBy: string) {
    // Check organization limits
    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.students)
      .where(eq(schema.students.organizationId, organizationId));

    const [org] = await this.db
      .select()
      .from(schema.organizations)
      .where(eq(schema.organizations.id, organizationId))
      .limit(1);

    if (Number(count) >= org.limits.maxStudents) {
      throw new BadRequestException(`Student limit reached (${org.limits.maxStudents}). Please upgrade your plan.`);
    }

    // Check if email already exists in organization
    const [existingUser] = await this.db
      .select()
      .from(schema.users)
      .where(
        and(eq(schema.users.email, dto.email), eq(schema.users.organizationId, organizationId)),
      )
      .limit(1);

    if (existingUser) {
      throw new ConflictException('Email already registered in this organization');
    }

    // Create user first
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const [user] = await this.db
      .insert(schema.users)
      .values({
        organizationId,
        email: dto.email,
        passwordHash,
        name: dto.name,
        role: 'student',
      })
      .returning();

    // Generate student code if not provided
    const studentCode = dto.studentCode || this.generateStudentCode(organizationId);

    // Create student profile
    const [student] = await this.db
      .insert(schema.students)
      .values({
        userId: user.id,
        organizationId,
        studentCode,
        dateOfBirth: dto.dateOfBirth,
        phone: dto.phone,
        address: dto.address,
        emergencyContact: dto.emergencyContact,
        enrollmentDate: dto.enrollmentDate || new Date().toISOString().split('T')[0],
        notes: dto.notes,
      })
      .returning();

    await this.auditLogService.log({
      organizationId,
      userId: createdBy,
      action: 'created',
      entityType: 'student',
      entityId: student.id,
      newValues: { email: user.email, name: user.name, studentCode },
    });

    return {
      ...student,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async bulkCreateStudents(organizationId: string, students: CreateStudentDto[], createdBy: string) {
    const results = [];
    const errors = [];

    for (let i = 0; i < students.length; i++) {
      try {
        const student = await this.createStudent(organizationId, students[i], createdBy);
        results.push({ index: i, success: true, data: student });
      } catch (error) {
        errors.push({
          index: i,
          success: false,
          email: students[i].email,
          error: error.message,
        });
      }
    }

    return { successful: results, failed: errors };
  }

  async listStudents(organizationId: string, query: StudentQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    const conditions = [eq(schema.students.organizationId, organizationId)];

    if (query.status) {
      conditions.push(eq(schema.students.status, query.status));
    }

    // Build base query with user join
    let studentsQuery = this.db
      .select({
        student: schema.students,
        user: schema.users,
      })
      .from(schema.students)
      .innerJoin(schema.users, eq(schema.students.userId, schema.users.id))
      .where(and(...conditions));

    if (query.search) {
      studentsQuery = this.db
        .select({
          student: schema.students,
          user: schema.users,
        })
        .from(schema.students)
        .innerJoin(schema.users, eq(schema.students.userId, schema.users.id))
        .where(
          and(
            ...conditions,
            or(
              ilike(schema.users.name, `%${query.search}%`),
              ilike(schema.users.email, `%${query.search}%`),
              ilike(schema.students.studentCode, `%${query.search}%`),
            ),
          ),
        );
    }

    const studentsData = await studentsQuery
      .orderBy(desc(schema.students.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.students)
      .where(and(...conditions));

    const formattedStudents = studentsData.map(({ student, user }) => ({
      ...student,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    }));

    return {
      data: formattedStudents,
      meta: {
        total: Number(count),
        page,
        limit,
        totalPages: Math.ceil(Number(count) / limit),
      },
    };
  }

  async getStudent(id: string, organizationId: string) {
    const [result] = await this.db
      .select({
        student: schema.students,
        user: schema.users,
      })
      .from(schema.students)
      .innerJoin(schema.users, eq(schema.students.userId, schema.users.id))
      .where(and(eq(schema.students.id, id), eq(schema.students.organizationId, organizationId)))
      .limit(1);

    if (!result) {
      throw new NotFoundException('Student not found');
    }

    return {
      ...result.student,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        avatarUrl: result.user.avatarUrl,
        isActive: result.user.isActive,
      },
    };
  }

  async updateStudent(id: string, organizationId: string, dto: UpdateStudentDto, updatedBy: string) {
    const student = await this.getStudent(id, organizationId);

    const updateData: any = { updatedAt: new Date() };

    if (dto.studentCode) updateData.studentCode = dto.studentCode;
    if (dto.dateOfBirth) updateData.dateOfBirth = dto.dateOfBirth;
    if (dto.phone) updateData.phone = dto.phone;
    if (dto.address) updateData.address = dto.address;
    if (dto.emergencyContact) updateData.emergencyContact = dto.emergencyContact;
    if (dto.status) updateData.status = dto.status;
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    const [updated] = await this.db
      .update(schema.students)
      .set(updateData)
      .where(eq(schema.students.id, id))
      .returning();

    // Update user name if provided
    if (dto.name) {
      await this.db
        .update(schema.users)
        .set({ name: dto.name, updatedAt: new Date() })
        .where(eq(schema.users.id, student.user.id));
    }

    await this.auditLogService.log({
      organizationId,
      userId: updatedBy,
      action: 'updated',
      entityType: 'student',
      entityId: id,
      oldValues: student,
      newValues: dto,
    });

    return this.getStudent(id, organizationId);
  }

  async deleteStudent(id: string, organizationId: string, deletedBy: string) {
    const student = await this.getStudent(id, organizationId);

    // Soft delete student
    await this.db
      .update(schema.students)
      .set({ deletedAt: new Date() })
      .where(eq(schema.students.id, id));

    // Soft delete user
    await this.db
      .update(schema.users)
      .set({ deletedAt: new Date(), isActive: false })
      .where(eq(schema.users.id, student.user.id));

    await this.auditLogService.log({
      organizationId,
      userId: deletedBy,
      action: 'deleted',
      entityType: 'student',
      entityId: id,
    });

    return { message: 'Student deleted successfully' };
  }

  async suspendStudent(id: string, organizationId: string, suspendedBy: string) {
    await this.getStudent(id, organizationId);

    const [updated] = await this.db
      .update(schema.students)
      .set({ status: 'suspended', updatedAt: new Date() })
      .where(eq(schema.students.id, id))
      .returning();

    await this.auditLogService.log({
      organizationId,
      userId: suspendedBy,
      action: 'suspended',
      entityType: 'student',
      entityId: id,
    });

    return updated;
  }

  async activateStudent(id: string, organizationId: string, activatedBy: string) {
    await this.getStudent(id, organizationId);

    const [updated] = await this.db
      .update(schema.students)
      .set({ status: 'active', updatedAt: new Date() })
      .where(eq(schema.students.id, id))
      .returning();

    await this.auditLogService.log({
      organizationId,
      userId: activatedBy,
      action: 'activated',
      entityType: 'student',
      entityId: id,
    });

    return updated;
  }

  async getStudentStats(id: string, organizationId: string) {
    await this.getStudent(id, organizationId);

    // TODO: Implement when test attempts are added
    return {
      totalTests: 0,
      completedTests: 0,
      averageScore: 0,
      lastTestDate: null,
    };
  }

  async assignToBatch(studentId: string, batchId: string, organizationId: string) {
    await this.getStudent(studentId, organizationId);

    // Verify batch belongs to organization
    const [batch] = await this.db
      .select()
      .from(schema.batches)
      .where(and(eq(schema.batches.id, batchId), eq(schema.batches.organizationId, organizationId)))
      .limit(1);

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    // Check if already assigned
    const [existing] = await this.db
      .select()
      .from(schema.batchStudents)
      .where(
        and(eq(schema.batchStudents.batchId, batchId), eq(schema.batchStudents.studentId, studentId)),
      )
      .limit(1);

    if (existing) {
      throw new ConflictException('Student already assigned to this batch');
    }

    const [assignment] = await this.db
      .insert(schema.batchStudents)
      .values({ batchId, studentId })
      .returning();

    return assignment;
  }

  async removeFromBatch(studentId: string, batchId: string, organizationId: string) {
    await this.getStudent(studentId, organizationId);

    await this.db
      .delete(schema.batchStudents)
      .where(
        and(eq(schema.batchStudents.batchId, batchId), eq(schema.batchStudents.studentId, studentId)),
      );

    return { message: 'Student removed from batch' };
  }
}
