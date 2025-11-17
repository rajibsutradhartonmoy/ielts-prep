import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, and, sql } from 'drizzle-orm';
import { DATABASE_CONNECTION, Database } from '@/database/database.module';
import * as schema from '@/database/schema';

@Injectable()
export class OrganizationService {
  constructor(@Inject(DATABASE_CONNECTION) private db: Database) {}

  async getOrganization(id: string) {
    const [organization] = await this.db
      .select()
      .from(schema.organizations)
      .where(eq(schema.organizations.id, id))
      .limit(1);

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async getOrganizationBySlug(slug: string) {
    const [organization] = await this.db
      .select()
      .from(schema.organizations)
      .where(eq(schema.organizations.slug, slug))
      .limit(1);

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async updateOrganizationInfo(id: string, data: { name?: string; email?: string; phone?: string; address?: any }) {
    const [updated] = await this.db
      .update(schema.organizations)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(schema.organizations.id, id))
      .returning();

    return updated;
  }

  async getOrganizationSettings(id: string) {
    const org = await this.getOrganization(id);
    return org.settings;
  }

  async updateOrganizationSettings(id: string, settings: any) {
    const [updated] = await this.db
      .update(schema.organizations)
      .set({
        settings,
        updatedAt: new Date(),
      })
      .where(eq(schema.organizations.id, id))
      .returning();

    return updated.settings;
  }

  async getOrganizationStats(id: string) {
    const [{ studentCount }] = await this.db
      .select({ studentCount: sql<number>`count(*)` })
      .from(schema.users)
      .where(
        and(
          eq(schema.users.organizationId, id),
          eq(schema.users.role, 'student'),
          eq(schema.users.deletedAt, sql`NULL`),
        ),
      );

    const [{ teacherCount }] = await this.db
      .select({ teacherCount: sql<number>`count(*)` })
      .from(schema.users)
      .where(
        and(
          eq(schema.users.organizationId, id),
          eq(schema.users.role, 'teacher'),
          eq(schema.users.deletedAt, sql`NULL`),
        ),
      );

    return {
      totalStudents: Number(studentCount),
      totalTeachers: Number(teacherCount),
      activeTests: 0, // TODO: Implement
      pendingGradings: 0, // TODO: Implement
    };
  }

  async getUsageStatistics(id: string) {
    const org = await this.getOrganization(id);

    const [{ studentCount }] = await this.db
      .select({ studentCount: sql<number>`count(*)` })
      .from(schema.users)
      .where(
        and(
          eq(schema.users.organizationId, id),
          eq(schema.users.role, 'student'),
        ),
      );

    const [{ teacherCount }] = await this.db
      .select({ teacherCount: sql<number>`count(*)` })
      .from(schema.users)
      .where(
        and(
          eq(schema.users.organizationId, id),
          eq(schema.users.role, 'teacher'),
        ),
      );

    return {
      limits: org.limits,
      usage: {
        students: { current: Number(studentCount), max: org.limits.maxStudents },
        teachers: { current: Number(teacherCount), max: org.limits.maxTeachers },
        testsThisMonth: { current: 0, max: org.limits.maxTestsPerMonth },
        storageGb: { current: 0, max: org.limits.maxStorageGb },
      },
    };
  }

  // Branding Methods
  async getBranding(organizationId: string) {
    const [branding] = await this.db
      .select()
      .from(schema.organizationBranding)
      .where(eq(schema.organizationBranding.organizationId, organizationId));

    return branding;
  }

  async updateBranding(organizationId: string, data: any) {
    const existing = await this.getBranding(organizationId);

    if (existing) {
      const [updated] = await this.db
        .update(schema.organizationBranding)
        .set(data)
        .where(eq(schema.organizationBranding.organizationId, organizationId))
        .returning();

      return updated;
    } else {
      const [created] = await this.db
        .insert(schema.organizationBranding)
        .values({
          organizationId,
          ...data,
        })
        .returning();

      return created;
    }
  }
}
