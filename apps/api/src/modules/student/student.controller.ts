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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StudentService } from './student.service';
import {
  CreateStudentDto,
  UpdateStudentDto,
  BulkCreateStudentDto,
  AssignToBatchDto,
  StudentQueryDto,
} from './dto/student.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  @Roles('organization_admin')
  @ApiOperation({ summary: 'Create a new student' })
  async createStudent(
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateStudentDto,
  ) {
    return this.studentService.createStudent(orgId, dto, userId);
  }

  @Post('bulk')
  @Roles('organization_admin')
  @ApiOperation({ summary: 'Bulk create students' })
  async bulkCreateStudents(
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: BulkCreateStudentDto,
  ) {
    return this.studentService.bulkCreateStudents(orgId, dto.students, userId);
  }

  @Get()
  @Roles('organization_admin', 'teacher')
  @ApiOperation({ summary: 'List all students' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'batchId', required: false })
  async listStudents(
    @CurrentUser('organizationId') orgId: string,
    @Query() query: StudentQueryDto,
  ) {
    return this.studentService.listStudents(orgId, query);
  }

  @Get(':id')
  @Roles('organization_admin', 'teacher')
  @ApiOperation({ summary: 'Get student details' })
  async getStudent(
    @CurrentUser('organizationId') orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.studentService.getStudent(id, orgId);
  }

  @Patch(':id')
  @Roles('organization_admin')
  @ApiOperation({ summary: 'Update student' })
  async updateStudent(
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStudentDto,
  ) {
    return this.studentService.updateStudent(id, orgId, dto, userId);
  }

  @Delete(':id')
  @Roles('organization_admin')
  @ApiOperation({ summary: 'Delete student' })
  async deleteStudent(
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.studentService.deleteStudent(id, orgId, userId);
  }

  @Post(':id/suspend')
  @Roles('organization_admin')
  @ApiOperation({ summary: 'Suspend student' })
  async suspendStudent(
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.studentService.suspendStudent(id, orgId, userId);
  }

  @Post(':id/activate')
  @Roles('organization_admin')
  @ApiOperation({ summary: 'Activate student' })
  async activateStudent(
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.studentService.activateStudent(id, orgId, userId);
  }

  @Get(':id/stats')
  @Roles('organization_admin', 'teacher')
  @ApiOperation({ summary: 'Get student statistics' })
  async getStudentStats(
    @CurrentUser('organizationId') orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.studentService.getStudentStats(id, orgId);
  }

  @Post(':id/batches/:batchId')
  @Roles('organization_admin')
  @ApiOperation({ summary: 'Assign student to batch' })
  async assignToBatch(
    @CurrentUser('organizationId') orgId: string,
    @Param('id', ParseUUIDPipe) studentId: string,
    @Param('batchId', ParseUUIDPipe) batchId: string,
  ) {
    return this.studentService.assignToBatch(studentId, batchId, orgId);
  }

  @Delete(':id/batches/:batchId')
  @Roles('organization_admin')
  @ApiOperation({ summary: 'Remove student from batch' })
  async removeFromBatch(
    @CurrentUser('organizationId') orgId: string,
    @Param('id', ParseUUIDPipe) studentId: string,
    @Param('batchId', ParseUUIDPipe) batchId: string,
  ) {
    return this.studentService.removeFromBatch(studentId, batchId, orgId);
  }
}
