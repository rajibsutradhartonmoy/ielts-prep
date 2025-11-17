import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { SystemAdminModule } from './modules/system-admin/system-admin.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { UserModule } from './modules/user/user.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { StudentModule } from './modules/student/student.module';
import { TeacherModule } from './modules/teacher/teacher.module';
import { BatchModule } from './modules/batch/batch.module';
import { TestModule } from './modules/test/test.module';
import { TestAssignmentModule } from './modules/test-assignment/test-assignment.module';
import { GradingModule } from './modules/grading/grading.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

import { TenantContextMiddleware } from './common/middleware/tenant-context.middleware';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    DatabaseModule,
    AuthModule,
    SystemAdminModule,
    OrganizationModule,
    UserModule,
    AuditLogModule,
    StudentModule,
    TeacherModule,
    BatchModule,
    TestModule,
    TestAssignmentModule,
    GradingModule,
    AnalyticsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantContextMiddleware).forRoutes('*');
  }
}
