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
import { TestAssignmentService } from './test-assignment.service';
import {
  CreateIndividualAssignmentDto,
  CreateBatchAssignmentDto,
  UpdateAssignmentDto,
  SaveProgressDto,
  SubmitTestDto,
} from './dto/test-assignment.dto';

@Controller('test-assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TestAssignmentController {
  constructor(
    private readonly testAssignmentService: TestAssignmentService,
  ) {}

  // Assignment management (Teacher/Admin)
  @Post('individual')
  @Roles('organization_admin', 'teacher')
  async createIndividualAssignment(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateIndividualAssignmentDto,
  ) {
    return this.testAssignmentService.createIndividualAssignment(
      req.user.organizationId,
      dto,
      req.user.id,
    );
  }

  @Post('batch')
  @Roles('organization_admin', 'teacher')
  async createBatchAssignment(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateBatchAssignmentDto,
  ) {
    return this.testAssignmentService.createBatchAssignment(
      req.user.organizationId,
      dto,
      req.user.id,
    );
  }

  @Get()
  @Roles('organization_admin', 'teacher', 'student')
  async getAssignments(
    @Request() req: AuthenticatedRequest,
    @Query('studentId') studentId?: string,
    @Query('batchId') batchId?: string,
    @Query('testId') testId?: string,
    @Query('status') status?: 'upcoming' | 'active' | 'past',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const options: any = {
      status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    };

    // Students can only see their own assignments
    if (req.user.role === 'student') {
      options.studentId = req.user.studentId;
    } else {
      if (studentId) options.studentId = studentId;
      if (batchId) options.batchId = batchId;
      if (testId) options.testId = testId;
    }

    return this.testAssignmentService.getAssignments(
      req.user.organizationId,
      options,
    );
  }

  @Get(':assignmentId')
  @Roles('organization_admin', 'teacher', 'student')
  async getAssignment(@Request() req: AuthenticatedRequest, @Param('assignmentId') assignmentId: string) {
    return this.testAssignmentService.getAssignmentById(
      req.user.organizationId,
      assignmentId,
    );
  }

  @Put(':assignmentId')
  @Roles('organization_admin', 'teacher')
  async updateAssignment(
    @Request() req: AuthenticatedRequest,
    @Param('assignmentId') assignmentId: string,
    @Body() dto: UpdateAssignmentDto,
  ) {
    return this.testAssignmentService.updateAssignment(
      req.user.organizationId,
      assignmentId,
      dto,
    );
  }

  @Delete(':assignmentId')
  @Roles('organization_admin', 'teacher')
  async deleteAssignment(
    @Request() req: AuthenticatedRequest,
    @Param('assignmentId') assignmentId: string,
  ) {
    return this.testAssignmentService.deleteAssignment(
      req.user.organizationId,
      assignmentId,
    );
  }

  // Student test-taking endpoints
  @Post(':assignmentId/start')
  @Roles('student')
  async startAttempt(@Request() req: AuthenticatedRequest, @Param('assignmentId') assignmentId: string) {
    if (!req.user.studentId) {
      throw new Error('Student ID not found in user context');
    }
    return this.testAssignmentService.startAttempt(
      req.user.studentId,
      assignmentId,
    );
  }

  @Get('attempts/:attemptId')
  @Roles('student', 'teacher', 'organization_admin')
  async getAttempt(@Request() req: AuthenticatedRequest, @Param('attemptId') attemptId: string) {
    // Students can only see their own attempts
    if (req.user.role === 'student') {
      if (!req.user.studentId) {
        throw new Error('Student ID not found in user context');
      }
      return this.testAssignmentService.getAttempt(
        req.user.studentId,
        attemptId,
      );
    }
    // Teachers/admins can see all attempts (add proper authorization)
    return this.testAssignmentService.getAttempt('', attemptId);
  }

  @Put('attempts/:attemptId/progress')
  @Roles('student')
  async saveProgress(
    @Request() req: AuthenticatedRequest,
    @Param('attemptId') attemptId: string,
    @Body() dto: SaveProgressDto,
  ) {
    if (!req.user.studentId) {
      throw new Error('Student ID not found in user context');
    }
    return this.testAssignmentService.saveProgress(
      req.user.studentId,
      attemptId,
      dto,
    );
  }

  @Post('attempts/:attemptId/submit')
  @Roles('student')
  async submitTest(
    @Request() req: AuthenticatedRequest,
    @Param('attemptId') attemptId: string,
    @Body() dto: SubmitTestDto,
  ) {
    if (!req.user.studentId) {
      throw new Error('Student ID not found in user context');
    }
    return this.testAssignmentService.submitTest(
      req.user.studentId,
      attemptId,
      dto,
    );
  }

  @Get(':assignmentId/student-attempts')
  @Roles('student')
  async getStudentAttempts(
    @Request() req: AuthenticatedRequest,
    @Param('assignmentId') assignmentId: string,
  ) {
    if (!req.user.studentId) {
      throw new Error('Student ID not found in user context');
    }
    return this.testAssignmentService.getStudentAttempts(
      req.user.studentId,
      assignmentId,
    );
  }
}
