import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DATABASE_CONNECTION, Database } from '@/database/database.module';
import * as schema from '@/database/schema';

@Injectable()
export class UserService {
  constructor(@Inject(DATABASE_CONNECTION) private db: Database) {}

  async findById(id: string) {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string, organizationId: string) {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(
        and(
          eq(schema.users.email, email),
          eq(schema.users.organizationId, organizationId),
        ),
      )
      .limit(1);

    return user;
  }

  async updateProfile(userId: string, data: { name?: string; avatarUrl?: string }) {
    const [updatedUser] = await this.db
      .update(schema.users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, userId))
      .returning();

    return updatedUser;
  }
}
