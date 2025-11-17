import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { eq, and, sql, isNull, desc, gte, lte, or, inArray } from 'drizzle-orm';
import { Inject } from '@nestjs/common';
import { DATABASE_CONNECTION, Database } from '../../database/database.module';
import * as schema from '../../database/schema';
import {
  CreateIndividualAssignmentDto,
  CreateBatchAssignmentDto,
  UpdateAssignmentDto,
  SaveProgressDto,
  SubmitTestDto,
} from './dto/test-assignment.dto';

@Injectable()
export class TestAssignmentService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  // Test Assignment CRUD
  async createIndividualAssignment(
    organizationId: string,
    dto: CreateIndividualAssignmentDto,
    assignedById: string,
  ) {
    // Verify test exists and is published
    const [test] = await this.db
      .select()
      .from(schema.tests)
      .where(
        and(
          eq(schema.tests.id, dto.testId),
          eq(schema.tests.organizationId, organizationId),
          eq(schema.tests.status, 'published'),
        ),
      );

    if (!test) {
      throw new NotFoundException('Test not found or not published');
    }

    // Verify student exists
    const [student] = await this.db
      .select()
      .from(schema.students)
      .where(
        and(
          eq(schema.students.id, dto.studentId),
          eq(schema.students.organizationId, organizationId),
        ),
      );

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const [assignment] = await this.db
      .insert(schema.testAssignments)
      .values({
        organizationId,
        testId: dto.testId,
        assignmentType: 'individual',
        studentId: dto.studentId,
        assignedById,
        startDate: new Date(dto.startDate),
        dueDate: new Date(dto.dueDate),
        settings: dto.settings || {},
        instructions: dto.instructions,
      })
      .returning();

    return assignment;
  }

  async createBatchAssignment(
    organizationId: string,
    dto: CreateBatchAssignmentDto,
    assignedById: string,
  ) {
    // Verify test exists and is published
    const [test] = await this.db
      .select()
      .from(schema.tests)
      .where(
        and(
          eq(schema.tests.id, dto.testId),
          eq(schema.tests.organizationId, organizationId),
          eq(schema.tests.status, 'published'),
        ),
      );

    if (!test) {
      throw new NotFoundException('Test not found or not published');
    }

    // Verify batch exists
    const [batch] = await this.db
      .select()
      .from(schema.batches)
      .where(
        and(
          eq(schema.batches.id, dto.batchId),
          eq(schema.batches.organizationId, organizationId),
        ),
      );

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    const [assignment] = await this.db
      .insert(schema.testAssignments)
      .values({
        organizationId,
        testId: dto.testId,
        assignmentType: 'batch',
        batchId: dto.batchId,
        assignedById,
        startDate: new Date(dto.startDate),
        dueDate: new Date(dto.dueDate),
        settings: dto.settings || {},
        instructions: dto.instructions,
      })
      .returning();

    return assignment;
  }

  async getAssignments(
    organizationId: string,
    options: {
      studentId?: string;
      batchId?: string;
      testId?: string;
      status?: 'upcoming' | 'active' | 'past';
      page?: number;
      limit?: number;
    } = {},
  ) {
    const { studentId, batchId, testId, status, page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const conditions = [eq(schema.testAssignments.organizationId, organizationId)];

    if (studentId) {
      conditions.push(
        or(
          eq(schema.testAssignments.studentId, studentId),
          // Include batch assignments for this student
          inArray(
            schema.testAssignments.batchId,
            this.db
              .select({ id: schema.batchStudents.batchId })
              .from(schema.batchStudents)
              .where(eq(schema.batchStudents.studentId, studentId)),
          ),
        ),
      );
    }

    if (batchId) {
      conditions.push(eq(schema.testAssignments.batchId, batchId));
    }

    if (testId) {
      conditions.push(eq(schema.testAssignments.testId, testId));
    }

    const now = new Date();
    if (status === 'upcoming') {
      conditions.push(gte(schema.testAssignments.startDate, now));
    } else if (status === 'active') {
      conditions.push(
        and(
          lte(schema.testAssignments.startDate, now),
          gte(schema.testAssignments.dueDate, now),
        ),
      );
    } else if (status === 'past') {
      conditions.push(lte(schema.testAssignments.dueDate, now));
    }

    const [assignments, countResult] = await Promise.all([
      this.db
        .select()
        .from(schema.testAssignments)
        .where(and(...conditions))
        .orderBy(desc(schema.testAssignments.startDate))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.testAssignments)
        .where(and(...conditions)),
    ]);

    return {
      data: assignments,
      meta: {
        total: Number(countResult[0].count),
        page,
        limit,
        totalPages: Math.ceil(Number(countResult[0].count) / limit),
      },
    };
  }

  async getAssignmentById(organizationId: string, assignmentId: string) {
    const [assignment] = await this.db
      .select()
      .from(schema.testAssignments)
      .where(
        and(
          eq(schema.testAssignments.id, assignmentId),
          eq(schema.testAssignments.organizationId, organizationId),
        ),
      );

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    return assignment;
  }

  async updateAssignment(
    organizationId: string,
    assignmentId: string,
    dto: UpdateAssignmentDto,
  ) {
    await this.getAssignmentById(organizationId, assignmentId);

    const updateData: any = { updatedAt: new Date() };

    if (dto.startDate !== undefined)
      updateData.startDate = new Date(dto.startDate);
    if (dto.dueDate !== undefined) updateData.dueDate = new Date(dto.dueDate);
    if (dto.settings !== undefined) updateData.settings = dto.settings;
    if (dto.instructions !== undefined)
      updateData.instructions = dto.instructions;

    const [updated] = await this.db
      .update(schema.testAssignments)
      .set(updateData)
      .where(eq(schema.testAssignments.id, assignmentId))
      .returning();

    return updated;
  }

  async deleteAssignment(organizationId: string, assignmentId: string) {
    await this.getAssignmentById(organizationId, assignmentId);

    // Check if any attempts exist
    const [attempt] = await this.db
      .select()
      .from(schema.testAttempts)
      .where(eq(schema.testAttempts.assignmentId, assignmentId))
      .limit(1);

    if (attempt) {
      throw new BadRequestException(
        'Cannot delete assignment with existing attempts',
      );
    }

    await this.db
      .delete(schema.testAssignments)
      .where(eq(schema.testAssignments.id, assignmentId));

    return { success: true };
  }

  // Test Attempt Management (Student Side)
  async startAttempt(studentId: string, assignmentId: string) {
    const assignment = await this.db.query.testAssignments.findFirst({
      where: eq(schema.testAssignments.id, assignmentId),
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Verify assignment is for this student
    if (assignment.assignmentType === 'individual') {
      if (assignment.studentId !== studentId) {
        throw new ForbiddenException('This assignment is not for you');
      }
    } else {
      // Check if student is in batch
      const [batchStudent] = await this.db
        .select()
        .from(schema.batchStudents)
        .where(
          and(
            eq(schema.batchStudents.batchId, assignment.batchId),
            eq(schema.batchStudents.studentId, studentId),
            eq(schema.batchStudents.isActive, true),
          ),
        );

      if (!batchStudent) {
        throw new ForbiddenException('You are not in the assigned batch');
      }
    }

    // Check if assignment is available
    const now = new Date();
    if (now < assignment.startDate) {
      throw new BadRequestException('Assignment has not started yet');
    }

    if (now > assignment.dueDate && !assignment.settings.allowLateSubmission) {
      throw new BadRequestException('Assignment deadline has passed');
    }

    // Check existing attempts
    const attempts = await this.db
      .select()
      .from(schema.testAttempts)
      .where(
        and(
          eq(schema.testAttempts.assignmentId, assignmentId),
          eq(schema.testAttempts.studentId, studentId),
        ),
      );

    // Get test to check max attempts
    const [test] = await this.db
      .select()
      .from(schema.tests)
      .where(eq(schema.tests.id, assignment.testId));

    const maxAttempts = test.settings.maxAttempts || 1;

    const completedAttempts = attempts.filter(
      (a) => a.status === 'submitted' || a.status === 'graded',
    ).length;

    if (completedAttempts >= maxAttempts) {
      throw new BadRequestException(
        `Maximum attempts (${maxAttempts}) reached`,
      );
    }

    // Check for in-progress attempt
    const inProgressAttempt = attempts.find(
      (a) => a.status === 'in_progress',
    );

    if (inProgressAttempt) {
      return inProgressAttempt;
    }

    // Create new attempt
    const [attempt] = await this.db
      .insert(schema.testAttempts)
      .values({
        assignmentId,
        studentId,
        testId: assignment.testId,
        attemptNumber: attempts.length + 1,
        status: 'in_progress',
        startedAt: new Date(),
        timeRemaining: test.totalDuration * 60, // Convert to seconds
        metrics: {
          totalTimeSpent: 0,
          questionsAnswered: 0,
          questionsFlagged: 0,
          sectionTimes: {},
        },
      })
      .returning();

    return attempt;
  }

  async getAttempt(studentId: string, attemptId: string) {
    const [attempt] = await this.db
      .select()
      .from(schema.testAttempts)
      .where(
        and(
          eq(schema.testAttempts.id, attemptId),
          eq(schema.testAttempts.studentId, studentId),
        ),
      );

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    return attempt;
  }

  async saveProgress(
    studentId: string,
    attemptId: string,
    dto: SaveProgressDto,
  ) {
    const attempt = await this.getAttempt(studentId, attemptId);

    if (attempt.status !== 'in_progress') {
      throw new BadRequestException('Cannot save progress on completed attempt');
    }

    const updateData: any = {
      answers: dto.answers,
      updatedAt: new Date(),
    };

    if (dto.currentSectionIndex !== undefined) {
      updateData.currentSectionIndex = dto.currentSectionIndex;
    }

    if (dto.currentQuestionIndex !== undefined) {
      updateData.currentQuestionIndex = dto.currentQuestionIndex;
    }

    const [updated] = await this.db
      .update(schema.testAttempts)
      .set(updateData)
      .where(eq(schema.testAttempts.id, attemptId))
      .returning();

    return updated;
  }

  async submitTest(studentId: string, attemptId: string, dto: SubmitTestDto) {
    const attempt = await this.getAttempt(studentId, attemptId);

    if (attempt.status !== 'in_progress') {
      throw new BadRequestException('Attempt is not in progress');
    }

    // Get test to auto-grade
    const test = await this.db.query.tests.findFirst({
      where: eq(schema.tests.id, attempt.testId),
      with: {
        sections: {
          with: {
            questions: true,
          },
        },
      },
    });

    // Process answers and create question responses
    let totalScore = 0;
    let maxPossibleScore = 0;
    const needsManualGrading = [];

    for (const answer of dto.answers) {
      const question = test.sections
        .flatMap((s) => s.questions)
        .find((q) => q.id === answer.questionId);

      if (!question) continue;

      maxPossibleScore += question.points;

      const isAutoGradable = [
        'multiple_choice',
        'true_false_not_given',
        'fill_blank',
        'short_answer',
      ].includes(question.type);

      let isCorrect = false;
      let pointsEarned = 0;

      if (isAutoGradable) {
        isCorrect = this.checkAnswer(question, answer.answer);
        pointsEarned = isCorrect ? question.points : 0;
        totalScore += pointsEarned;
      }

      const [response] = await this.db
        .insert(schema.questionResponses)
        .values({
          attemptId,
          questionId: answer.questionId,
          sectionId: question.sectionId,
          studentAnswer: answer.answer,
          isCorrect: isAutoGradable ? isCorrect : null,
          pointsEarned: isAutoGradable ? pointsEarned : null,
          maxPoints: question.points,
          flagged: answer.flagged || false,
          needsManualGrading: !isAutoGradable,
        })
        .returning();

      if (!isAutoGradable) {
        needsManualGrading.push(response);
      }
    }

    const percentageScore = Math.round((totalScore / maxPossibleScore) * 100);
    const bandScore = this.calculateBandScore(percentageScore);

    // Update attempt
    const [updatedAttempt] = await this.db
      .update(schema.testAttempts)
      .set({
        answers: dto.answers,
        status: needsManualGrading.length > 0 ? 'submitted' : 'graded',
        submittedAt: new Date(),
        completedAt:
          needsManualGrading.length > 0 ? null : new Date(),
        rawScore: totalScore,
        maxScore: maxPossibleScore,
        percentageScore,
        bandScore,
        updatedAt: new Date(),
      })
      .where(eq(schema.testAttempts.id, attemptId))
      .returning();

    // Add to grading queue if needed
    if (needsManualGrading.length > 0) {
      for (const response of needsManualGrading) {
        await this.db.insert(schema.gradingQueue).values({
          organizationId: test.organizationId,
          attemptId,
          responseId: response.id,
          status: 'pending',
          priority: 'normal',
          questionType: response.questionType,
        });
      }
    }

    return updatedAttempt;
  }

  private checkAnswer(question: any, studentAnswer: any): boolean {
    if (question.type === 'multiple_choice') {
      const correctOption = question.options?.find((o) => o.isCorrect);
      return correctOption?.id === studentAnswer;
    }

    if (question.type === 'true_false_not_given') {
      return question.correctAnswer === studentAnswer;
    }

    if (question.type === 'fill_blank' || question.type === 'short_answer') {
      const caseSensitive = question.caseSensitive || false;
      const studentAns = caseSensitive
        ? studentAnswer
        : studentAnswer.toLowerCase();

      if (question.acceptableAnswers && question.acceptableAnswers.length > 0) {
        return question.acceptableAnswers.some((ans: string) => {
          const acceptableAns = caseSensitive ? ans : ans.toLowerCase();
          return acceptableAns === studentAns;
        });
      }

      const correctAns = caseSensitive
        ? question.correctAnswer
        : question.correctAnswer.toLowerCase();
      return correctAns === studentAns;
    }

    return false;
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

  // Get student attempts for an assignment
  async getStudentAttempts(studentId: string, assignmentId: string) {
    return this.db
      .select()
      .from(schema.testAttempts)
      .where(
        and(
          eq(schema.testAttempts.assignmentId, assignmentId),
          eq(schema.testAttempts.studentId, studentId),
        ),
      )
      .orderBy(desc(schema.testAttempts.attemptNumber));
  }
}
