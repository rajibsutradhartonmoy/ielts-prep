import {
  Controller,
  Get,
  Post,
  Put,
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
import { GradingService } from './grading.service';
import {
  GradeResponseDto,
  AssignGradingDto,
  UpdateQueueItemDto,
  CreateFeedbackTemplateDto,
} from './dto/grading.dto';

@Controller('grading')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GradingController {
  constructor(private readonly gradingService: GradingService) {}

  // Grading Queue
  @Get('queue')
  @Roles('organization_admin', 'teacher')
  async getGradingQueue(
    @Request() req: AuthenticatedRequest,
    @Query('teacherId') teacherId?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const options: any = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    };

    // Teachers can only see their own queue
    if (req.user.role === 'teacher') {
      options.teacherId = req.user.teacherId;
    } else if (teacherId) {
      options.teacherId = teacherId;
    }

    if (status) options.status = status;
    if (priority) options.priority = priority;

    return this.gradingService.getGradingQueue(
      req.user.organizationId,
      options,
    );
  }

  @Get('queue/:queueItemId')
  @Roles('organization_admin', 'teacher')
  async getQueueItem(@Request() req: AuthenticatedRequest, @Param('queueItemId') queueItemId: string) {
    return this.gradingService.getQueueItemById(
      req.user.organizationId,
      queueItemId,
    );
  }

  @Post('queue/:queueItemId/assign')
  @Roles('organization_admin')
  async assignGrading(
    @Request() req: AuthenticatedRequest,
    @Param('queueItemId') queueItemId: string,
    @Body() dto: AssignGradingDto,
  ) {
    return this.gradingService.assignGrading(
      req.user.organizationId,
      queueItemId,
      dto,
    );
  }

  @Put('queue/:queueItemId')
  @Roles('organization_admin', 'teacher')
  async updateQueueItem(
    @Request() req: AuthenticatedRequest,
    @Param('queueItemId') queueItemId: string,
    @Body() dto: UpdateQueueItemDto,
  ) {
    return this.gradingService.updateQueueItem(
      req.user.organizationId,
      queueItemId,
      dto,
    );
  }

  // Grade Response
  @Post('grade')
  @Roles('teacher')
  async gradeResponse(
    @Request() req: AuthenticatedRequest,
    @Body() dto: GradeResponseDto,
    @Query('timeSpent') timeSpent?: string,
  ) {
    if (!req.user.teacherId) {
      throw new Error('Teacher ID not found in user context');
    }
    const time = timeSpent ? parseInt(timeSpent, 10) : 0;
    return this.gradingService.gradeResponse(
      req.user.organizationId,
      req.user.teacherId,
      dto,
      time,
    );
  }

  @Get('feedback/:responseId')
  @Roles('organization_admin', 'teacher', 'student')
  async getResponseFeedback(@Param('responseId') responseId: string) {
    return this.gradingService.getResponseFeedback(responseId);
  }

  // Feedback Templates
  @Post('templates')
  @Roles('teacher', 'organization_admin')
  async createFeedbackTemplate(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateFeedbackTemplateDto,
  ) {
    return this.gradingService.createFeedbackTemplate(
      req.user.organizationId,
      req.user.teacherId || req.user.id,
      dto,
    );
  }

  @Get('templates')
  @Roles('teacher', 'organization_admin')
  async getFeedbackTemplates(
    @Request() req: AuthenticatedRequest,
    @Query('category') category?: string,
  ) {
    const teacherId = req.user.role === 'teacher' ? req.user.teacherId : undefined;
    return this.gradingService.getFeedbackTemplates(
      req.user.organizationId,
      teacherId,
      category,
    );
  }

  // Teacher Stats
  @Get('stats/:teacherId')
  @Roles('teacher', 'organization_admin')
  async getTeacherGradingStats(@Param('teacherId') teacherId: string) {
    return this.gradingService.getTeacherGradingStats(teacherId);
  }
}
