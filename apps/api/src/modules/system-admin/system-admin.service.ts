import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, desc, sql, ilike, and } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { DATABASE_CONNECTION, Database } from '@/database/database.module';
import * as schema from '@/database/schema';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto/system-admin.dto';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class SystemAdminService {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: Database,
    private auditLogService: AuditLogService,
  ) {}

  async createOrganization(dto: CreateOrganizationDto, systemAdminId: string) {
    // Generate slug from name
    const slug = dto.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

    // Check if slug exists
    const [existingSlug] = await this.db
      .select()
      .from(schema.organizations)
      .where(eq(schema.organizations.slug, slug))
      .limit(1);

    if (existingSlug) {
      throw new BadRequestException('Organization with this name already exists');
    }

    // Create organization
    const [organization] = await this.db
      .insert(schema.organizations)
      .values({
        name: dto.name,
        slug,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        subscriptionTier: dto.subscriptionTier || 'free',
        subscriptionStatus: 'trial',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
        createdBy: systemAdminId,
      })
      .returning();

    // Create default branding
    await this.db.insert(schema.organizationBranding).values({
      organizationId: organization.id,
    });

    // Create admin user for organization
    const passwordHash = await bcrypt.hash(dto.adminPassword, 12);
    await this.db.insert(schema.users).values({
      organizationId: organization.id,
      email: dto.adminEmail,
      passwordHash,
      name: dto.adminName,
      role: 'organization_admin',
      emailVerifiedAt: new Date(), // Auto-verified by system admin
    });

    // Log audit
    await this.auditLogService.log({
      systemAdminId,
      action: 'created',
      entityType: 'organization',
      entityId: organization.id,
      newValues: { name: organization.name, email: organization.email },
    });

    return organization;
  }

  async listOrganizations(page = 1, limit = 20, search?: string) {
    const offset = (page - 1) * limit;

    let query = this.db
      .select()
      .from(schema.organizations)
      .where(eq(schema.organizations.deletedAt, sql`NULL`));

    if (search) {
      query = this.db
        .select()
        .from(schema.organizations)
        .where(
          and(
            eq(schema.organizations.deletedAt, sql`NULL`),
            ilike(schema.organizations.name, `%${search}%`),
          ),
        );
    }

    const organizations = await query
      .orderBy(desc(schema.organizations.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.organizations)
      .where(eq(schema.organizations.deletedAt, sql`NULL`));

    return {
      data: organizations,
      meta: {
        total: Number(count),
        page,
        limit,
        totalPages: Math.ceil(Number(count) / limit),
      },
    };
  }

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

  async updateOrganization(id: string, dto: UpdateOrganizationDto, systemAdminId: string) {
    const organization = await this.getOrganization(id);

    const [updated] = await this.db
      .update(schema.organizations)
      .set({
        ...dto,
        updatedAt: new Date(),
      })
      .where(eq(schema.organizations.id, id))
      .returning();

    await this.auditLogService.log({
      systemAdminId,
      action: 'updated',
      entityType: 'organization',
      entityId: id,
      oldValues: organization,
      newValues: updated,
    });

    return updated;
  }

  async suspendOrganization(id: string, systemAdminId: string) {
    await this.getOrganization(id);

    const [updated] = await this.db
      .update(schema.organizations)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(schema.organizations.id, id))
      .returning();

    await this.auditLogService.log({
      systemAdminId,
      action: 'suspended',
      entityType: 'organization',
      entityId: id,
    });

    return updated;
  }

  async activateOrganization(id: string, systemAdminId: string) {
    await this.getOrganization(id);

    const [updated] = await this.db
      .update(schema.organizations)
      .set({
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(schema.organizations.id, id))
      .returning();

    await this.auditLogService.log({
      systemAdminId,
      action: 'activated',
      entityType: 'organization',
      entityId: id,
    });

    return updated;
  }

  async getOrganizationUsage(id: string) {
    const organization = await this.getOrganization(id);

    // Get user counts
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
      organization: organization.name,
      limits: organization.limits,
      usage: {
        students: Number(studentCount),
        teachers: Number(teacherCount),
        testsThisMonth: 0, // TODO: Implement when test schema is added
        storageUsedGb: 0, // TODO: Implement storage tracking
      },
    };
  }

  async getSystemStats() {
    const [{ totalOrgs }] = await this.db
      .select({ totalOrgs: sql<number>`count(*)` })
      .from(schema.organizations)
      .where(eq(schema.organizations.deletedAt, sql`NULL`));

    const [{ activeOrgs }] = await this.db
      .select({ activeOrgs: sql<number>`count(*)` })
      .from(schema.organizations)
      .where(
        and(
          eq(schema.organizations.isActive, true),
          eq(schema.organizations.deletedAt, sql`NULL`),
        ),
      );

    const [{ totalUsers }] = await this.db
      .select({ totalUsers: sql<number>`count(*)` })
      .from(schema.users)
      .where(eq(schema.users.deletedAt, sql`NULL`));

    return {
      totalOrganizations: Number(totalOrgs),
      activeOrganizations: Number(activeOrgs),
      totalUsers: Number(totalUsers),
    };
  }
}
