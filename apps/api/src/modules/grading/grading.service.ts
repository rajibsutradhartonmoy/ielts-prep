import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { eq, and, sql, desc, asc, or, isNull } from 'drizzle-orm';
import { Inject } from '@nestjs/common';
import { DATABASE_CONNECTION, Database } from '../../database/database.module';
import * as schema from '../../database/schema';
import {
  GradeResponseDto,
  AssignGradingDto,
  UpdateQueueItemDto,
  CreateFeedbackTemplateDto,
} from './dto/grading.dto';

@Injectable()
export class GradingService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  // Grading Queue Management
  async getGradingQueue(
    organizationId: string,
    options: {
      teacherId?: string;
      status?: string;
      priority?: string;
      page?: number;
      limit?: number;
    } = {},
  ) {
    const { teacherId, status, priority, page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const conditions = [eq(schema.gradingQueue.organizationId, organizationId)];

    if (teacherId) {
      conditions.push(eq(schema.gradingQueue.assignedTeacherId, teacherId));
    }

    if (status) {
      conditions.push(eq(schema.gradingQueue.status, status as any));
    }

    if (priority) {
      conditions.push(eq(schema.gradingQueue.priority, priority as any));
    }

    const [items, countResult] = await Promise.all([
      this.db
        .select()
        .from(schema.gradingQueue)
        .where(and(...conditions))
        .orderBy(
          desc(schema.gradingQueue.priority),
          asc(schema.gradingQueue.createdAt),
        )
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.gradingQueue)
        .where(and(...conditions)),
    ]);

    return {
      data: items,
      meta: {
        total: Number(countResult[0].count),
        page,
        limit,
        totalPages: Math.ceil(Number(countResult[0].count) / limit),
      },
    };
  }

  async getQueueItemById(organizationId: string, queueItemId: string) {
    const [item] = await this.db
      .select()
      .from(schema.gradingQueue)
      .where(
        and(
          eq(schema.gradingQueue.id, queueItemId),
          eq(schema.gradingQueue.organizationId, organizationId),
        ),
      );

    if (!item) {
      throw new NotFoundException('Grading queue item not found');
    }

    return item;
  }

  async assignGrading(
    organizationId: string,
    queueItemId: string,
    dto: AssignGradingDto,
  ) {
    await this.getQueueItemById(organizationId, queueItemId);

    // Verify teacher exists
    const [teacher] = await this.db
      .select()
      .from(schema.teachers)
      .where(
        and(
          eq(schema.teachers.id, dto.teacherId),
          eq(schema.teachers.organizationId, organizationId),
        ),
      );

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    const [updated] = await this.db
      .update(schema.gradingQueue)
      .set({
        assignedTeacherId: dto.teacherId,
        updatedAt: new Date(),
      })
      .where(eq(schema.gradingQueue.id, queueItemId))
      .returning();

    return updated;
  }

  async updateQueueItem(
    organizationId: string,
    queueItemId: string,
    dto: UpdateQueueItemDto,
  ) {
    await this.getQueueItemById(organizationId, queueItemId);

    const updateData: any = { updatedAt: new Date() };

    if (dto.status !== undefined) {
      updateData.status = dto.status;
      if (dto.status === 'in_progress' && !updateData.startedAt) {
        updateData.startedAt = new Date();
      }
      if (dto.status === 'completed' && !updateData.completedAt) {
        updateData.completedAt = new Date();
      }
    }

    if (dto.priority !== undefined) {
      updateData.priority = dto.priority;
    }

    const [updated] = await this.db
      .update(schema.gradingQueue)
      .set(updateData)
      .where(eq(schema.gradingQueue.id, queueItemId))
      .returning();

    return updated;
  }

  // Grading Responses
  async gradeResponse(
    organizationId: string,
    teacherId: string,
    dto: GradeResponseDto,
    timeSpentGrading: number,
  ) {
    // Get response
    const [response] = await this.db
      .select()
      .from(schema.questionResponses)
      .where(eq(schema.questionResponses.id, dto.responseId));

    if (!response) {
      throw new NotFoundException('Response not found');
    }

    if (!response.needsManualGrading) {
      throw new BadRequestException('This response does not need manual grading');
    }

    // Calculate points from band scores
    let pointsEarned = 0;
    if (dto.writingScores) {
      pointsEarned = Math.round(
        (dto.writingScores.overallBand / 9) * response.maxPoints,
      );
    } else if (dto.speakingScores) {
      pointsEarned = Math.round(
        (dto.speakingScores.overallBand / 9) * response.maxPoints,
      );
    }

    // Update question response
    await this.db
      .update(schema.questionResponses)
      .set({
        pointsEarned,
        gradedById: teacherId,
        gradedAt: new Date(),
        feedback: dto.overallFeedback,
        detailedScores: (dto.writingScores || dto.speakingScores || {}) as Record<string, number>,
        updatedAt: new Date(),
      })
      .where(eq(schema.questionResponses.id, dto.responseId));

    // Create grading feedback
    const [feedback] = await this.db
      .insert(schema.gradingFeedback)
      .values({
        responseId: dto.responseId,
        teacherId,
        writingScores: dto.writingScores,
        speakingScores: dto.speakingScores,
        overallFeedback: dto.overallFeedback,
        strengthsHighlighted: dto.strengthsHighlighted || [],
        areasForImprovement: dto.areasForImprovement || [],
        specificComments: dto.specificComments || [],
        audioFeedbackUrl: dto.audioFeedbackUrl,
        annotatedResponse: dto.annotatedResponse,
        timeSpentGrading,
      })
      .returning();

    // Update grading queue
    await this.db
      .update(schema.gradingQueue)
      .set({
        status: 'completed',
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.gradingQueue.responseId, dto.responseId));

    // Check if all responses for this attempt are graded
    await this.checkAttemptCompletion(response.attemptId);

    // Update teacher grading stats
    await this.updateTeacherStats(teacherId, timeSpentGrading);

    return feedback;
  }

  private async checkAttemptCompletion(attemptId: string) {
    // Check if all responses are graded
    const [pending] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.questionResponses)
      .where(
        and(
          eq(schema.questionResponses.attemptId, attemptId),
          eq(schema.questionResponses.needsManualGrading, true),
          isNull(schema.questionResponses.gradedAt),
        ),
      );

    if (Number(pending.count) === 0) {
      // All graded, calculate final score
      const responses = await this.db
        .select()
        .from(schema.questionResponses)
        .where(eq(schema.questionResponses.attemptId, attemptId));

      const totalScore = responses.reduce(
        (sum, r) => sum + (r.pointsEarned || 0),
        0,
      );
      const maxScore = responses.reduce((sum, r) => sum + r.maxPoints, 0);
      const percentageScore = Math.round((totalScore / maxScore) * 100);
      const bandScore = this.calculateBandScore(percentageScore);

      await this.db
        .update(schema.testAttempts)
        .set({
          status: 'graded',
          completedAt: new Date(),
          rawScore: totalScore,
          maxScore,
          percentageScore,
          bandScore,
          updatedAt: new Date(),
        })
        .where(eq(schema.testAttempts.id, attemptId));
    }
  }

  private calculateBandScore(percentage: number): number {
    if (percentage >= 95) return 9;
    if (percentage >= 90) return 8.5;
    if (percentage >= 85) return 8;
    if (percentage >= 80) return 7.5;
    if (percentage >= 75) return 7;
    if (percentage >= 70) return 6.5;
    if (percentage >= 65) return 6;
    if (percentage >= 60) return 5.5;
    if (percentage >= 55) return 5;
    if (percentage >= 50) return 4.5;
    if (percentage >= 45) return 4;
    if (percentage >= 40) return 3.5;
    if (percentage >= 35) return 3;
    if (percentage >= 30) return 2.5;
    if (percentage >= 25) return 2;
    if (percentage >= 20) return 1.5;
    return 1;
  }

  private async updateTeacherStats(teacherId: string, timeSpent: number) {
    const [stats] = await this.db
      .select()
      .from(schema.teacherGradingStats)
      .where(eq(schema.teacherGradingStats.teacherId, teacherId));

    if (!stats) {
      await this.db.insert(schema.teacherGradingStats).values({
        teacherId,
        totalGraded: 1,
        averageTimePerGrading: timeSpent,
        lastGradedAt: new Date(),
      });
    } else {
      const totalGraded = (stats.totalGraded ?? 0) + 1;
      const avgTime = Math.round(
        ((stats.averageTimePerGrading ?? 0) * (stats.totalGraded ?? 0) + timeSpent) /
          totalGraded,
      );

      await this.db
        .update(schema.teacherGradingStats)
        .set({
          totalGraded,
          averageTimePerGrading: avgTime,
          lastGradedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(schema.teacherGradingStats.teacherId, teacherId));
    }
  }

  // Feedback Templates
  async createFeedbackTemplate(
    organizationId: string,
    teacherId: string,
    dto: CreateFeedbackTemplateDto,
  ) {
    const [template] = await this.db
      .insert(schema.feedbackTemplates)
      .values({
        organizationId,
        teacherId,
        name: dto.name,
        category: dto.category,
        templateText: dto.templateText,
        isGlobal: dto.isGlobal || false,
      })
      .returning();

    return template;
  }

  async getFeedbackTemplates(
    organizationId: string,
    teacherId?: string,
    category?: string,
  ) {
    const conditions = [
      eq(schema.feedbackTemplates.organizationId, organizationId),
    ];

    if (teacherId) {
      const teacherCondition = or(
        eq(schema.feedbackTemplates.teacherId, teacherId),
        eq(schema.feedbackTemplates.isGlobal, true),
      );
      if (teacherCondition) {
        conditions.push(teacherCondition);
      }
    }

    if (category) {
      conditions.push(eq(schema.feedbackTemplates.category, category));
    }

    return this.db
      .select()
      .from(schema.feedbackTemplates)
      .where(and(...conditions))
      .orderBy(desc(schema.feedbackTemplates.usageCount));
  }

  async getTeacherGradingStats(teacherId: string) {
    const [stats] = await this.db
      .select()
      .from(schema.teacherGradingStats)
      .where(eq(schema.teacherGradingStats.teacherId, teacherId));

    if (!stats) {
      return {
        totalGraded: 0,
        writingTasksGraded: 0,
        speakingTasksGraded: 0,
        averageTimePerGrading: 0,
        currentQueueSize: 0,
      };
    }

    return stats;
  }

  async getResponseFeedback(responseId: string) {
    const [feedback] = await this.db
      .select()
      .from(schema.gradingFeedback)
      .where(eq(schema.gradingFeedback.responseId, responseId));

    return feedback;
  }
}
