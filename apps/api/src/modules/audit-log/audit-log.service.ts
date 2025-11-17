import { Injectable, Inject } from '@nestjs/common';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';
import { DATABASE_CONNECTION, Database } from '@/database/database.module';
import * as schema from '@/database/schema';

export interface AuditLogEntry {
  organizationId?: string;
  userId?: string;
  systemAdminId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditLogService {
  constructor(@Inject(DATABASE_CONNECTION) private db: Database) {}

  async log(entry: AuditLogEntry) {
    await this.db.insert(schema.auditLogs).values(entry);
  }

  async getAuditLogs(
    organizationId?: string,
    filters?: {
      userId?: string;
      action?: string;
      entityType?: string;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    },
  ) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (organizationId) {
      conditions.push(eq(schema.auditLogs.organizationId, organizationId));
    }

    if (filters?.userId) {
      conditions.push(eq(schema.auditLogs.userId, filters.userId));
    }

    if (filters?.action) {
      conditions.push(eq(schema.auditLogs.action, filters.action));
    }

    if (filters?.entityType) {
      conditions.push(eq(schema.auditLogs.entityType, filters.entityType));
    }

    if (filters?.startDate) {
      conditions.push(gte(schema.auditLogs.createdAt, filters.startDate));
    }

    if (filters?.endDate) {
      conditions.push(lte(schema.auditLogs.createdAt, filters.endDate));
    }

    const logs = await this.db
      .select()
      .from(schema.auditLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(schema.auditLogs.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.auditLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return {
      data: logs,
      meta: {
        total: Number(count),
        page,
        limit,
        totalPages: Math.ceil(Number(count) / limit),
      },
    };
  }
}
