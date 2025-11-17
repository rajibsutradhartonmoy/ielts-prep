import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { eq, and, sql, isNull, desc, asc, ilike, or } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service';
import * as schema from '../../database/schema';
import {
  CreateTestDto,
  UpdateTestDto,
  CreateSectionDto,
  UpdateSectionDto,
  CreateQuestionDto,
  UpdateQuestionDto,
  CloneTestDto,
} from './dto/test.dto';

@Injectable()
export class TestService {
  constructor(private readonly db: DatabaseService) {}

  // Test CRUD Operations
  async createTest(
    organizationId: string,
    dto: CreateTestDto,
    createdById: string,
  ) {
    const [test] = await this.db
      .insert(schema.tests)
      .values({
        organizationId,
        createdById,
        title: dto.title,
        description: dto.description,
        type: dto.type as any,
        totalDuration: dto.totalDuration,
        passingScore: dto.passingScore,
        instructions: dto.instructions,
        settings: dto.settings || {},
        tags: dto.tags || [],
      })
      .returning();

    return test;
  }

  async getTests(
    organizationId: string,
    options: {
      status?: string;
      type?: string;
      search?: string;
      page?: number;
      limit?: number;
    } = {},
  ) {
    const { status, type, search, page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const conditions = [
      eq(schema.tests.organizationId, organizationId),
      isNull(schema.tests.deletedAt),
    ];

    if (status) {
      conditions.push(eq(schema.tests.status, status as any));
    }

    if (type) {
      conditions.push(eq(schema.tests.type, type as any));
    }

    if (search) {
      conditions.push(
        or(
          ilike(schema.tests.title, `%${search}%`),
          ilike(schema.tests.description, `%${search}%`),
        ),
      );
    }

    const [tests, countResult] = await Promise.all([
      this.db
        .select()
        .from(schema.tests)
        .where(and(...conditions))
        .orderBy(desc(schema.tests.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.tests)
        .where(and(...conditions)),
    ]);

    return {
      data: tests,
      meta: {
        total: Number(countResult[0].count),
        page,
        limit,
        totalPages: Math.ceil(Number(countResult[0].count) / limit),
      },
    };
  }

  async getTestById(organizationId: string, testId: string) {
    const [test] = await this.db
      .select()
      .from(schema.tests)
      .where(
        and(
          eq(schema.tests.id, testId),
          eq(schema.tests.organizationId, organizationId),
          isNull(schema.tests.deletedAt),
        ),
      );

    if (!test) {
      throw new NotFoundException('Test not found');
    }

    return test;
  }

  async getTestWithSections(organizationId: string, testId: string) {
    const test = await this.getTestById(organizationId, testId);

    const sections = await this.db
      .select()
      .from(schema.testSections)
      .where(eq(schema.testSections.testId, testId))
      .orderBy(asc(schema.testSections.orderIndex));

    return { ...test, sections };
  }

  async getFullTest(organizationId: string, testId: string) {
    const test = await this.getTestById(organizationId, testId);

    const sections = await this.db
      .select()
      .from(schema.testSections)
      .where(eq(schema.testSections.testId, testId))
      .orderBy(asc(schema.testSections.orderIndex));

    const sectionsWithQuestions = await Promise.all(
      sections.map(async (section) => {
        const questions = await this.db
          .select()
          .from(schema.questions)
          .where(eq(schema.questions.sectionId, section.id))
          .orderBy(asc(schema.questions.orderIndex));

        return { ...section, questions };
      }),
    );

    return { ...test, sections: sectionsWithQuestions };
  }

  async updateTest(
    organizationId: string,
    testId: string,
    dto: UpdateTestDto,
  ) {
    const test = await this.getTestById(organizationId, testId);

    if (test.status === 'published' && dto.status !== 'archived') {
      // Only allow archiving published tests, not editing
      const allowedFields = ['status', 'tags'];
      const attemptedFields = Object.keys(dto);
      const disallowedEdits = attemptedFields.filter(
        (f) => !allowedFields.includes(f),
      );

      if (disallowedEdits.length > 0) {
        throw new BadRequestException(
          'Cannot edit published test. Archive it first or only update tags.',
        );
      }
    }

    const updateData: any = { updatedAt: new Date() };

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.status !== undefined) {
      updateData.status = dto.status;
      if (dto.status === 'published') {
        updateData.publishedAt = new Date();
      }
    }
    if (dto.totalDuration !== undefined)
      updateData.totalDuration = dto.totalDuration;
    if (dto.passingScore !== undefined)
      updateData.passingScore = dto.passingScore;
    if (dto.instructions !== undefined)
      updateData.instructions = dto.instructions;
    if (dto.settings !== undefined) updateData.settings = dto.settings;
    if (dto.tags !== undefined) updateData.tags = dto.tags;

    const [updatedTest] = await this.db
      .update(schema.tests)
      .set(updateData)
      .where(eq(schema.tests.id, testId))
      .returning();

    return updatedTest;
  }

  async deleteTest(organizationId: string, testId: string) {
    const test = await this.getTestById(organizationId, testId);

    if (test.status === 'published') {
      throw new BadRequestException(
        'Cannot delete published test. Archive it first.',
      );
    }

    await this.db
      .update(schema.tests)
      .set({ deletedAt: new Date() })
      .where(eq(schema.tests.id, testId));

    return { success: true };
  }

  async cloneTest(
    organizationId: string,
    testId: string,
    dto: CloneTestDto,
    createdById: string,
  ) {
    const originalTest = await this.getFullTest(organizationId, testId);

    const [newTest] = await this.db
      .insert(schema.tests)
      .values({
        organizationId,
        createdById,
        title: dto.newTitle || `${originalTest.title} (Copy)`,
        description: originalTest.description,
        type: originalTest.type,
        totalDuration: originalTest.totalDuration,
        passingScore: originalTest.passingScore,
        instructions: originalTest.instructions,
        settings: originalTest.settings,
        tags: originalTest.tags,
        status: 'draft',
      })
      .returning();

    if (dto.includeSections !== false && originalTest.sections) {
      for (const section of originalTest.sections) {
        const [newSection] = await this.db
          .insert(schema.testSections)
          .values({
            testId: newTest.id,
            type: section.type,
            title: section.title,
            instructions: section.instructions,
            duration: section.duration,
            orderIndex: section.orderIndex,
            audioUrl: section.audioUrl,
            passageText: section.passageText,
            imageUrl: section.imageUrl,
            metadata: section.metadata,
          })
          .returning();

        if (dto.includeQuestions !== false && section.questions) {
          for (const question of section.questions) {
            await this.db.insert(schema.questions).values({
              sectionId: newSection.id,
              type: question.type,
              questionText: question.questionText,
              orderIndex: question.orderIndex,
              points: question.points,
              options: question.options,
              matchingItems: question.matchingItems,
              correctAnswer: question.correctAnswer,
              acceptableAnswers: question.acceptableAnswers,
              caseSensitive: question.caseSensitive,
              questionInstructions: question.questionInstructions,
              gradingCriteria: question.gradingCriteria,
              imageUrl: question.imageUrl,
              audioUrl: question.audioUrl,
              explanation: question.explanation,
              hints: question.hints,
              metadata: question.metadata,
            });
          }
        }

        // Update section question count
        await this.updateSectionQuestionCount(newSection.id);
      }

      // Update test total questions
      await this.updateTestQuestionCount(newTest.id);
    }

    return this.getFullTest(organizationId, newTest.id);
  }

  // Section CRUD Operations
  async createSection(
    organizationId: string,
    testId: string,
    dto: CreateSectionDto,
  ) {
    const test = await this.getTestById(organizationId, testId);

    if (test.status === 'published') {
      throw new BadRequestException('Cannot add sections to published test');
    }

    const [section] = await this.db
      .insert(schema.testSections)
      .values({
        testId,
        type: dto.type as any,
        title: dto.title,
        instructions: dto.instructions,
        duration: dto.duration,
        orderIndex: dto.orderIndex,
        audioUrl: dto.audioUrl,
        passageText: dto.passageText,
        imageUrl: dto.imageUrl,
      })
      .returning();

    return section;
  }

  async getSections(organizationId: string, testId: string) {
    await this.getTestById(organizationId, testId);

    return this.db
      .select()
      .from(schema.testSections)
      .where(eq(schema.testSections.testId, testId))
      .orderBy(asc(schema.testSections.orderIndex));
  }

  async getSectionById(
    organizationId: string,
    testId: string,
    sectionId: string,
  ) {
    await this.getTestById(organizationId, testId);

    const [section] = await this.db
      .select()
      .from(schema.testSections)
      .where(
        and(
          eq(schema.testSections.id, sectionId),
          eq(schema.testSections.testId, testId),
        ),
      );

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    return section;
  }

  async updateSection(
    organizationId: string,
    testId: string,
    sectionId: string,
    dto: UpdateSectionDto,
  ) {
    const test = await this.getTestById(organizationId, testId);

    if (test.status === 'published') {
      throw new BadRequestException('Cannot edit sections of published test');
    }

    await this.getSectionById(organizationId, testId, sectionId);

    const updateData: any = { updatedAt: new Date() };

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.instructions !== undefined)
      updateData.instructions = dto.instructions;
    if (dto.duration !== undefined) updateData.duration = dto.duration;
    if (dto.orderIndex !== undefined) updateData.orderIndex = dto.orderIndex;
    if (dto.audioUrl !== undefined) updateData.audioUrl = dto.audioUrl;
    if (dto.passageText !== undefined) updateData.passageText = dto.passageText;
    if (dto.imageUrl !== undefined) updateData.imageUrl = dto.imageUrl;

    const [updatedSection] = await this.db
      .update(schema.testSections)
      .set(updateData)
      .where(eq(schema.testSections.id, sectionId))
      .returning();

    return updatedSection;
  }

  async deleteSection(
    organizationId: string,
    testId: string,
    sectionId: string,
  ) {
    const test = await this.getTestById(organizationId, testId);

    if (test.status === 'published') {
      throw new BadRequestException(
        'Cannot delete sections from published test',
      );
    }

    await this.getSectionById(organizationId, testId, sectionId);

    await this.db
      .delete(schema.testSections)
      .where(eq(schema.testSections.id, sectionId));

    await this.updateTestQuestionCount(testId);

    return { success: true };
  }

  // Question CRUD Operations
  async createQuestion(
    organizationId: string,
    testId: string,
    sectionId: string,
    dto: CreateQuestionDto,
  ) {
    const test = await this.getTestById(organizationId, testId);

    if (test.status === 'published') {
      throw new BadRequestException('Cannot add questions to published test');
    }

    await this.getSectionById(organizationId, testId, sectionId);

    const [question] = await this.db
      .insert(schema.questions)
      .values({
        sectionId,
        type: dto.type as any,
        questionText: dto.questionText,
        orderIndex: dto.orderIndex,
        points: dto.points || 1,
        options: dto.options,
        matchingItems: dto.matchingItems,
        correctAnswer: dto.correctAnswer,
        acceptableAnswers: dto.acceptableAnswers,
        caseSensitive: dto.caseSensitive || false,
        questionInstructions: dto.questionInstructions,
        gradingCriteria: dto.gradingCriteria,
        imageUrl: dto.imageUrl,
        audioUrl: dto.audioUrl,
        explanation: dto.explanation,
        hints: dto.hints,
      })
      .returning();

    await this.updateSectionQuestionCount(sectionId);
    await this.updateTestQuestionCount(testId);

    return question;
  }

  async getQuestions(
    organizationId: string,
    testId: string,
    sectionId: string,
  ) {
    await this.getSectionById(organizationId, testId, sectionId);

    return this.db
      .select()
      .from(schema.questions)
      .where(eq(schema.questions.sectionId, sectionId))
      .orderBy(asc(schema.questions.orderIndex));
  }

  async getQuestionById(
    organizationId: string,
    testId: string,
    sectionId: string,
    questionId: string,
  ) {
    await this.getSectionById(organizationId, testId, sectionId);

    const [question] = await this.db
      .select()
      .from(schema.questions)
      .where(
        and(
          eq(schema.questions.id, questionId),
          eq(schema.questions.sectionId, sectionId),
        ),
      );

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return question;
  }

  async updateQuestion(
    organizationId: string,
    testId: string,
    sectionId: string,
    questionId: string,
    dto: UpdateQuestionDto,
  ) {
    const test = await this.getTestById(organizationId, testId);

    if (test.status === 'published') {
      throw new BadRequestException('Cannot edit questions of published test');
    }

    await this.getQuestionById(organizationId, testId, sectionId, questionId);

    const updateData: any = { updatedAt: new Date() };

    if (dto.questionText !== undefined)
      updateData.questionText = dto.questionText;
    if (dto.orderIndex !== undefined) updateData.orderIndex = dto.orderIndex;
    if (dto.points !== undefined) updateData.points = dto.points;
    if (dto.options !== undefined) updateData.options = dto.options;
    if (dto.matchingItems !== undefined)
      updateData.matchingItems = dto.matchingItems;
    if (dto.correctAnswer !== undefined)
      updateData.correctAnswer = dto.correctAnswer;
    if (dto.acceptableAnswers !== undefined)
      updateData.acceptableAnswers = dto.acceptableAnswers;
    if (dto.caseSensitive !== undefined)
      updateData.caseSensitive = dto.caseSensitive;
    if (dto.questionInstructions !== undefined)
      updateData.questionInstructions = dto.questionInstructions;
    if (dto.gradingCriteria !== undefined)
      updateData.gradingCriteria = dto.gradingCriteria;
    if (dto.imageUrl !== undefined) updateData.imageUrl = dto.imageUrl;
    if (dto.audioUrl !== undefined) updateData.audioUrl = dto.audioUrl;
    if (dto.explanation !== undefined) updateData.explanation = dto.explanation;
    if (dto.hints !== undefined) updateData.hints = dto.hints;

    const [updatedQuestion] = await this.db
      .update(schema.questions)
      .set(updateData)
      .where(eq(schema.questions.id, questionId))
      .returning();

    return updatedQuestion;
  }

  async deleteQuestion(
    organizationId: string,
    testId: string,
    sectionId: string,
    questionId: string,
  ) {
    const test = await this.getTestById(organizationId, testId);

    if (test.status === 'published') {
      throw new BadRequestException(
        'Cannot delete questions from published test',
      );
    }

    await this.getQuestionById(organizationId, testId, sectionId, questionId);

    await this.db
      .delete(schema.questions)
      .where(eq(schema.questions.id, questionId));

    await this.updateSectionQuestionCount(sectionId);
    await this.updateTestQuestionCount(testId);

    return { success: true };
  }

  async reorderQuestions(
    organizationId: string,
    testId: string,
    sectionId: string,
    questions: Array<{ id: string; orderIndex: number }>,
  ) {
    const test = await this.getTestById(organizationId, testId);

    if (test.status === 'published') {
      throw new BadRequestException(
        'Cannot reorder questions of published test',
      );
    }

    await this.getSectionById(organizationId, testId, sectionId);

    for (const q of questions) {
      await this.db
        .update(schema.questions)
        .set({ orderIndex: q.orderIndex, updatedAt: new Date() })
        .where(eq(schema.questions.id, q.id));
    }

    return this.getQuestions(organizationId, testId, sectionId);
  }

  // Helper methods
  private async updateSectionQuestionCount(sectionId: string) {
    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.questions)
      .where(eq(schema.questions.sectionId, sectionId));

    await this.db
      .update(schema.testSections)
      .set({ totalQuestions: Number(count), updatedAt: new Date() })
      .where(eq(schema.testSections.id, sectionId));
  }

  private async updateTestQuestionCount(testId: string) {
    const sections = await this.db
      .select({ totalQuestions: schema.testSections.totalQuestions })
      .from(schema.testSections)
      .where(eq(schema.testSections.testId, testId));

    const totalQuestions = sections.reduce(
      (sum, s) => sum + s.totalQuestions,
      0,
    );

    await this.db
      .update(schema.tests)
      .set({ totalQuestions, updatedAt: new Date() })
      .where(eq(schema.tests.id, testId));
  }

  // Statistics
  async getTestStatistics(organizationId: string) {
    const [stats] = await this.db
      .select({
        total: sql<number>`count(*)`,
        draft: sql<number>`count(*) filter (where ${schema.tests.status} = 'draft')`,
        published: sql<number>`count(*) filter (where ${schema.tests.status} = 'published')`,
        archived: sql<number>`count(*) filter (where ${schema.tests.status} = 'archived')`,
      })
      .from(schema.tests)
      .where(
        and(
          eq(schema.tests.organizationId, organizationId),
          isNull(schema.tests.deletedAt),
        ),
      );

    return {
      total: Number(stats.total),
      draft: Number(stats.draft),
      published: Number(stats.published),
      archived: Number(stats.archived),
    };
  }
}
