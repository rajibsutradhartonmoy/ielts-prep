import { Injectable } from '@nestjs/common';
import { eq, and, sql, gte, lte, inArray, desc } from 'drizzle-orm';
import { Inject } from '@nestjs/common';
import { DATABASE_CONNECTION, Database } from '../../database/database.module';
import * as schema from '../../database/schema';
import { GenerateReportDto, GetAnalyticsDto } from './dto/analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  // Student Analytics
  async getStudentAnalytics(studentId: string) {
    let [analytics] = await this.db
      .select()
      .from(schema.studentAnalytics)
      .where(eq(schema.studentAnalytics.studentId, studentId));

    if (!analytics) {
      // Calculate and create analytics
      analytics = await this.calculateStudentAnalytics(studentId);
    }

    return analytics;
  }

  private async calculateStudentAnalytics(studentId: string) {
    const attempts = await this.db
      .select()
      .from(schema.testAttempts)
      .where(
        and(
          eq(schema.testAttempts.studentId, studentId),
          eq(schema.testAttempts.status, 'graded'),
        ),
      );

    const totalTests = attempts.length;
    const totalPassed = attempts.filter((a) => a.isPassed).length;
    const avgBand =
      attempts.reduce((sum, a) => sum + (a.bandScore || 0), 0) / totalTests ||
      0;
    const bestBand = Math.max(...attempts.map((a) => a.bandScore || 0));

    const [student] = await this.db
      .select()
      .from(schema.students)
      .where(eq(schema.students.id, studentId));

    const [analytics] = await this.db
      .insert(schema.studentAnalytics)
      .values({
        studentId,
        organizationId: student.organizationId,
        totalTestsTaken: totalTests,
        totalTestsPassed: totalPassed,
        averageBandScore: Math.round(avgBand * 10),
        bestBandScore: Math.round(bestBand * 10),
        lastTestDate: attempts[0]?.submittedAt,
      })
      .returning();

    return analytics;
  }

  async updateStudentAnalytics(studentId: string) {
    return this.calculateStudentAnalytics(studentId);
  }

  // Test Analytics
  async getTestAnalytics(testId: string) {
    let [analytics] = await this.db
      .select()
      .from(schema.testAnalytics)
      .where(eq(schema.testAnalytics.testId, testId));

    if (!analytics) {
      analytics = await this.calculateTestAnalytics(testId);
    }

    return analytics;
  }

  private async calculateTestAnalytics(testId: string) {
    const attempts = await this.db
      .select()
      .from(schema.testAttempts)
      .where(eq(schema.testAttempts.testId, testId));

    const completed = attempts.filter((a) => a.status === 'graded');
    const totalAttempts = attempts.length;
    const completedAttempts = completed.length;

    const avgScore =
      completed.reduce((sum, a) => sum + (a.percentageScore || 0), 0) /
        completedAttempts || 0;
    const avgBand =
      completed.reduce((sum, a) => sum + (a.bandScore || 0), 0) /
        completedAttempts || 0;
    const passRate =
      (completed.filter((a) => a.isPassed).length / completedAttempts) * 100 ||
      0;

    const [test] = await this.db
      .select()
      .from(schema.tests)
      .where(eq(schema.tests.id, testId));

    const [analytics] = await this.db
      .insert(schema.testAnalytics)
      .values({
        testId,
        organizationId: test.organizationId,
        totalAttempts,
        completedAttempts,
        averageScore: Math.round(avgScore),
        averageBandScore: Math.round(avgBand * 10),
        passRate: Math.round(passRate),
      })
      .returning();

    return analytics;
  }

  // Organization Dashboard Analytics
  async getOrganizationDashboard(
    organizationId: string,
    dto?: GetAnalyticsDto,
  ) {
    const now = new Date();
    const startDate = dto?.startDate
      ? new Date(dto.startDate)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = dto?.endDate ? new Date(dto.endDate) : now;

    // Get overall stats
    const [studentCount] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.students)
      .where(eq(schema.students.organizationId, organizationId));

    const [teacherCount] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.teachers)
      .where(eq(schema.teachers.organizationId, organizationId));

    const [testCount] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.tests)
      .where(eq(schema.tests.organizationId, organizationId));

    const [attemptCount] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.testAttempts)
      .where(
        and(
          eq(schema.testAttempts.testId, sql`ANY(SELECT id FROM tests WHERE organization_id = ${organizationId})`),
          gte(schema.testAttempts.createdAt, startDate),
          lte(schema.testAttempts.createdAt, endDate),
        ),
      );

    // Get recent test performance
    const recentAttempts = await this.db
      .select({
        bandScore: schema.testAttempts.bandScore,
        status: schema.testAttempts.status,
      })
      .from(schema.testAttempts)
      .where(
        and(
          gte(schema.testAttempts.submittedAt, startDate),
          lte(schema.testAttempts.submittedAt, endDate),
        ),
      )
      .limit(100);

    const avgBandScore =
      recentAttempts
        .filter((a) => a.bandScore !== null)
        .reduce((sum, a) => sum + (a.bandScore ?? 0), 0) / recentAttempts.length || 0;

    return {
      overview: {
        totalStudents: Number(studentCount.count),
        totalTeachers: Number(teacherCount.count),
        totalTests: Number(testCount.count),
        totalAttempts: Number(attemptCount.count),
        averageBandScore: avgBandScore,
      },
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    };
  }

  // Student Performance Report
  async getStudentPerformanceReport(
    organizationId: string,
    dto: GetAnalyticsDto,
  ) {
    const conditions = [];

    if (dto.startDate && dto.endDate) {
      conditions.push(
        and(
          gte(schema.testAttempts.submittedAt, new Date(dto.startDate)),
          lte(schema.testAttempts.submittedAt, new Date(dto.endDate)),
        ),
      );
    }

    if (dto.studentIds && dto.studentIds.length > 0) {
      conditions.push(inArray(schema.testAttempts.studentId, dto.studentIds));
    }

    const attempts = await this.db
      .select({
        studentId: schema.testAttempts.studentId,
        bandScore: schema.testAttempts.bandScore,
        percentageScore: schema.testAttempts.percentageScore,
        isPassed: schema.testAttempts.isPassed,
        submittedAt: schema.testAttempts.submittedAt,
      })
      .from(schema.testAttempts)
      .where(and(...conditions));

    // Group by student
    const studentPerformance = attempts.reduce((acc, attempt) => {
      if (!acc[attempt.studentId]) {
        acc[attempt.studentId] = {
          studentId: attempt.studentId,
          totalTests: 0,
          passedTests: 0,
          averageBandScore: 0,
          scores: [],
        };
      }

      acc[attempt.studentId].totalTests++;
      if (attempt.isPassed) acc[attempt.studentId].passedTests++;
      if (attempt.bandScore) acc[attempt.studentId].scores.push(attempt.bandScore);

      return acc;
    }, {} as Record<string, any>);

    // Calculate averages
    Object.values(studentPerformance).forEach((student: any) => {
      student.averageBandScore =
        student.scores.reduce((sum: number, score: number) => sum + score, 0) /
          student.scores.length || 0;
      student.passRate = (student.passedTests / student.totalTests) * 100;
      delete student.scores;
    });

    return Object.values(studentPerformance);
  }

  // Test Performance Analytics
  async getTestPerformanceAnalytics(organizationId: string, testId: string) {
    const attempts = await this.db
      .select()
      .from(schema.testAttempts)
      .where(
        and(
          eq(schema.testAttempts.testId, testId),
          eq(schema.testAttempts.status, 'graded'),
        ),
      );

    // Band score distribution
    const bandDistribution = attempts.reduce((acc, attempt) => {
      const band = attempt.bandScore || 0;
      acc[band] = (acc[band] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // Question-level analytics
    const responses = await this.db
      .select()
      .from(schema.questionResponses)
      .where(
        inArray(
          schema.questionResponses.attemptId,
          attempts.map((a) => a.id),
        ),
      );

    const questionAccuracy = responses.reduce((acc, response) => {
      if (!acc[response.questionId]) {
        acc[response.questionId] = {
          questionId: response.questionId,
          totalResponses: 0,
          correctResponses: 0,
        };
      }

      acc[response.questionId].totalResponses++;
      if (response.isCorrect) {
        acc[response.questionId].correctResponses++;
      }

      return acc;
    }, {} as Record<string, any>);

    Object.values(questionAccuracy).forEach((q: any) => {
      q.accuracy = (q.correctResponses / q.totalResponses) * 100;
    });

    return {
      totalAttempts: attempts.length,
      averageScore:
        attempts.reduce((sum, a) => sum + (a.percentageScore || 0), 0) /
          attempts.length || 0,
      averageBandScore:
        attempts.reduce((sum, a) => sum + (a.bandScore || 0), 0) /
          attempts.length || 0,
      passRate:
        (attempts.filter((a) => a.isPassed).length / attempts.length) * 100 ||
        0,
      bandDistribution,
      questionAccuracy: Object.values(questionAccuracy)
        .filter((q: any) => q.accuracy < 60)
        .sort((a: any, b: any) => a.accuracy - b.accuracy)
        .slice(0, 10),
    };
  }

  // Generate Report
  async generateReport(
    organizationId: string,
    generatedById: string,
    dto: GenerateReportDto,
  ) {
    const [report] = await this.db
      .insert(schema.generatedReports)
      .values({
        organizationId,
        generatedById,
        reportType: dto.reportType as any,
        reportFormat: dto.reportFormat as any,
        title: dto.title,
        description: dto.description,
        filters: dto.filters || {},
        dateRange: dto.dateRange,
        processingStartedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      })
      .returning();

    // Process report asynchronously (placeholder)
    this.processReport(report.id, dto);

    return report;
  }

  private async processReport(reportId: string, dto: GenerateReportDto) {
    try {
      await this.db
        .update(schema.generatedReports)
        .set({ status: 'processing' })
        .where(eq(schema.generatedReports.id, reportId));

      // Generate report data based on type
      let data: any;
      switch (dto.reportType) {
        case 'student_performance':
          data = { placeholder: 'Student performance data' };
          break;
        case 'test_analytics':
          data = { placeholder: 'Test analytics data' };
          break;
        default:
          data = {};
      }

      await this.db
        .update(schema.generatedReports)
        .set({
          status: 'completed',
          data,
          processingCompletedAt: new Date(),
        })
        .where(eq(schema.generatedReports.id, reportId));
    } catch (error) {
      await this.db
        .update(schema.generatedReports)
        .set({
          status: 'failed',
          errorMessage: error.message,
        })
        .where(eq(schema.generatedReports.id, reportId));
    }
  }

  async getGeneratedReports(organizationId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const [reports, countResult] = await Promise.all([
      this.db
        .select()
        .from(schema.generatedReports)
        .where(eq(schema.generatedReports.organizationId, organizationId))
        .orderBy(desc(schema.generatedReports.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.generatedReports)
        .where(eq(schema.generatedReports.organizationId, organizationId)),
    ]);

    return {
      data: reports,
      meta: {
        total: Number(countResult[0].count),
        page,
        limit,
        totalPages: Math.ceil(Number(countResult[0].count) / limit),
      },
    };
  }

  async getReport(organizationId: string, reportId: string) {
    const [report] = await this.db
      .select()
      .from(schema.generatedReports)
      .where(
        and(
          eq(schema.generatedReports.id, reportId),
          eq(schema.generatedReports.organizationId, organizationId),
        ),
      );

    return report;
  }
}
