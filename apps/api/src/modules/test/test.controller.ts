import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthenticatedRequest } from '../../common/types/request.types';
import { TestService } from './test.service';
import {
  CreateTestDto,
  UpdateTestDto,
  CreateSectionDto,
  UpdateSectionDto,
  CreateQuestionDto,
  UpdateQuestionDto,
  ReorderQuestionsDto,
  CloneTestDto,
} from './dto/test.dto';

@Controller('tests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TestController {
  constructor(private readonly testService: TestService) {}

  // Test endpoints
  @Post()
  @Roles('organization_admin', 'teacher')
  async createTest(@Request() req: AuthenticatedRequest, @Body() dto: CreateTestDto) {
    return this.testService.createTest(
      req.user.organizationId,
      dto,
      req.user.id,
    );
  }

  @Get()
  @Roles('organization_admin', 'teacher')
  async getTests(
    @Request() req: AuthenticatedRequest,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.testService.getTests(req.user.organizationId, {
      status,
      type,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('statistics')
  @Roles('organization_admin', 'teacher')
  async getTestStatistics(@Request() req: AuthenticatedRequest) {
    return this.testService.getTestStatistics(req.user.organizationId);
  }

  @Get(':testId')
  @Roles('organization_admin', 'teacher')
  async getTestById(@Request() req: AuthenticatedRequest, @Param('testId') testId: string) {
    return this.testService.getTestById(req.user.organizationId, testId);
  }

  @Get(':testId/full')
  @Roles('organization_admin', 'teacher')
  async getFullTest(@Request() req: AuthenticatedRequest, @Param('testId') testId: string) {
    return this.testService.getFullTest(req.user.organizationId, testId);
  }

  @Put(':testId')
  @Roles('organization_admin', 'teacher')
  async updateTest(
    @Request() req: AuthenticatedRequest,
    @Param('testId') testId: string,
    @Body() dto: UpdateTestDto,
  ) {
    return this.testService.updateTest(req.user.organizationId, testId, dto);
  }

  @Delete(':testId')
  @Roles('organization_admin', 'teacher')
  async deleteTest(@Request() req: AuthenticatedRequest, @Param('testId') testId: string) {
    return this.testService.deleteTest(req.user.organizationId, testId);
  }

  @Post(':testId/clone')
  @Roles('organization_admin', 'teacher')
  async cloneTest(
    @Request() req: AuthenticatedRequest,
    @Param('testId') testId: string,
    @Body() dto: CloneTestDto,
  ) {
    return this.testService.cloneTest(
      req.user.organizationId,
      testId,
      dto,
      req.user.id,
    );
  }

  // Section endpoints
  @Post(':testId/sections')
  @Roles('organization_admin', 'teacher')
  async createSection(
    @Request() req: AuthenticatedRequest,
    @Param('testId') testId: string,
    @Body() dto: CreateSectionDto,
  ) {
    return this.testService.createSection(
      req.user.organizationId,
      testId,
      dto,
    );
  }

  @Get(':testId/sections')
  @Roles('organization_admin', 'teacher')
  async getSections(@Request() req: AuthenticatedRequest, @Param('testId') testId: string) {
    return this.testService.getSections(req.user.organizationId, testId);
  }

  @Get(':testId/sections/:sectionId')
  @Roles('organization_admin', 'teacher')
  async getSectionById(
    @Request() req: AuthenticatedRequest,
    @Param('testId') testId: string,
    @Param('sectionId') sectionId: string,
  ) {
    return this.testService.getSectionById(
      req.user.organizationId,
      testId,
      sectionId,
    );
  }

  @Put(':testId/sections/:sectionId')
  @Roles('organization_admin', 'teacher')
  async updateSection(
    @Request() req: AuthenticatedRequest,
    @Param('testId') testId: string,
    @Param('sectionId') sectionId: string,
    @Body() dto: UpdateSectionDto,
  ) {
    return this.testService.updateSection(
      req.user.organizationId,
      testId,
      sectionId,
      dto,
    );
  }

  @Delete(':testId/sections/:sectionId')
  @Roles('organization_admin', 'teacher')
  async deleteSection(
    @Request() req: AuthenticatedRequest,
    @Param('testId') testId: string,
    @Param('sectionId') sectionId: string,
  ) {
    return this.testService.deleteSection(
      req.user.organizationId,
      testId,
      sectionId,
    );
  }

  // Question endpoints
  @Post(':testId/sections/:sectionId/questions')
  @Roles('organization_admin', 'teacher')
  async createQuestion(
    @Request() req: AuthenticatedRequest,
    @Param('testId') testId: string,
    @Param('sectionId') sectionId: string,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.testService.createQuestion(
      req.user.organizationId,
      testId,
      sectionId,
      dto,
    );
  }

  @Get(':testId/sections/:sectionId/questions')
  @Roles('organization_admin', 'teacher')
  async getQuestions(
    @Request() req: AuthenticatedRequest,
    @Param('testId') testId: string,
    @Param('sectionId') sectionId: string,
  ) {
    return this.testService.getQuestions(
      req.user.organizationId,
      testId,
      sectionId,
    );
  }

  @Get(':testId/sections/:sectionId/questions/:questionId')
  @Roles('organization_admin', 'teacher')
  async getQuestionById(
    @Request() req: AuthenticatedRequest,
    @Param('testId') testId: string,
    @Param('sectionId') sectionId: string,
    @Param('questionId') questionId: string,
  ) {
    return this.testService.getQuestionById(
      req.user.organizationId,
      testId,
      sectionId,
      questionId,
    );
  }

  @Put(':testId/sections/:sectionId/questions/:questionId')
  @Roles('organization_admin', 'teacher')
  async updateQuestion(
    @Request() req: AuthenticatedRequest,
    @Param('testId') testId: string,
    @Param('sectionId') sectionId: string,
    @Param('questionId') questionId: string,
    @Body() dto: UpdateQuestionDto,
  ) {
    return this.testService.updateQuestion(
      req.user.organizationId,
      testId,
      sectionId,
      questionId,
      dto,
    );
  }

  @Delete(':testId/sections/:sectionId/questions/:questionId')
  @Roles('organization_admin', 'teacher')
  async deleteQuestion(
    @Request() req: AuthenticatedRequest,
    @Param('testId') testId: string,
    @Param('sectionId') sectionId: string,
    @Param('questionId') questionId: string,
  ) {
    return this.testService.deleteQuestion(
      req.user.organizationId,
      testId,
      sectionId,
      questionId,
    );
  }

  @Put(':testId/sections/:sectionId/questions/reorder')
  @Roles('organization_admin', 'teacher')
  async reorderQuestions(
    @Request() req: AuthenticatedRequest,
    @Param('testId') testId: string,
    @Param('sectionId') sectionId: string,
    @Body() dto: ReorderQuestionsDto,
  ) {
    return this.testService.reorderQuestions(
      req.user.organizationId,
      testId,
      sectionId,
      dto.questions,
    );
  }
}
