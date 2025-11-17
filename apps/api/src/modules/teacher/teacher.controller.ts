import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TeacherService } from './teacher.service';
import { CreateTeacherDto, UpdateTeacherDto, TeacherQueryDto } from './dto/teacher.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('teachers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('teachers')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Post()
  @Roles('organization_admin')
  @ApiOperation({ summary: 'Create a new teacher' })
  async createTeacher(
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTeacherDto,
  ) {
    return this.teacherService.createTeacher(orgId, dto, userId);
  }

  @Get()
  @Roles('organization_admin')
  @ApiOperation({ summary: 'List all teachers' })
  async listTeachers(
    @CurrentUser('organizationId') orgId: string,
    @Query() query: TeacherQueryDto,
  ) {
    return this.teacherService.listTeachers(orgId, query);
  }

  @Get(':id')
  @Roles('organization_admin')
  @ApiOperation({ summary: 'Get teacher details' })
  async getTeacher(
    @CurrentUser('organizationId') orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.teacherService.getTeacher(id, orgId);
  }

  @Patch(':id')
  @Roles('organization_admin')
  @ApiOperation({ summary: 'Update teacher' })
  async updateTeacher(
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTeacherDto,
  ) {
    return this.teacherService.updateTeacher(id, orgId, dto, userId);
  }

  @Delete(':id')
  @Roles('organization_admin')
  @ApiOperation({ summary: 'Delete teacher' })
  async deleteTeacher(
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.teacherService.deleteTeacher(id, orgId, userId);
  }

  @Get(':id/stats')
  @Roles('organization_admin')
  @ApiOperation({ summary: 'Get teacher statistics' })
  async getTeacherStats(
    @CurrentUser('organizationId') orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.teacherService.getTeacherStats(id, orgId);
  }

  @Get(':id/workload')
  @Roles('organization_admin')
  @ApiOperation({ summary: 'Get teacher workload' })
  async getTeacherWorkload(
    @CurrentUser('organizationId') orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.teacherService.getTeacherWorkload(id, orgId);
  }

  @Post(':id/batches/:batchId')
  @Roles('organization_admin')
  @ApiOperation({ summary: 'Assign teacher to batch' })
  async assignToBatch(
    @CurrentUser('organizationId') orgId: string,
    @Param('id', ParseUUIDPipe) teacherId: string,
    @Param('batchId', ParseUUIDPipe) batchId: string,
  ) {
    return this.teacherService.assignToBatch(teacherId, batchId, orgId);
  }

  @Delete(':id/batches/:batchId')
  @Roles('organization_admin')
  @ApiOperation({ summary: 'Remove teacher from batch' })
  async removeFromBatch(
    @CurrentUser('organizationId') orgId: string,
    @Param('id', ParseUUIDPipe) teacherId: string,
    @Param('batchId', ParseUUIDPipe) batchId: string,
  ) {
    return this.teacherService.removeFromBatch(teacherId, batchId, orgId);
  }
}
