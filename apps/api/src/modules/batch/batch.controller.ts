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
import { BatchService } from './batch.service';
import {
  CreateBatchDto,
  UpdateBatchDto,
  AddStudentsToBatchDto,
  AddTeachersToBatchDto,
  BatchQueryDto,
} from './dto/batch.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('batches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('batches')
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @Post()
  @Roles('organization_admin')
  @ApiOperation({ summary: 'Create a new batch' })
  async createBatch(
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateBatchDto,
  ) {
    return this.batchService.createBatch(orgId, dto, userId);
  }

  @Get()
  @Roles('organization_admin', 'teacher')
  @ApiOperation({ summary: 'List all batches' })
  async listBatches(@CurrentUser('organizationId') orgId: string, @Query() query: BatchQueryDto) {
    return this.batchService.listBatches(orgId, query);
  }

  @Get(':id')
  @Roles('organization_admin', 'teacher')
  @ApiOperation({ summary: 'Get batch details with students and teachers' })
  async getBatch(
    @CurrentUser('organizationId') orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.batchService.getBatch(id, orgId);
  }

  @Patch(':id')
  @Roles('organization_admin')
  @ApiOperation({ summary: 'Update batch' })
  async updateBatch(
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBatchDto,
  ) {
    return this.batchService.updateBatch(id, orgId, dto, userId);
  }

  @Delete(':id')
  @Roles('organization_admin')
  @ApiOperation({ summary: 'Delete batch' })
  async deleteBatch(
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.batchService.deleteBatch(id, orgId, userId);
  }

  @Post(':id/students')
  @Roles('organization_admin')
  @ApiOperation({ summary: 'Add multiple students to batch' })
  async addStudentsToBatch(
    @CurrentUser('organizationId') orgId: string,
    @Param('id', ParseUUIDPipe) batchId: string,
    @Body() dto: AddStudentsToBatchDto,
  ) {
    return this.batchService.addStudentsToBatch(batchId, dto.studentIds, orgId);
  }

  @Delete(':id/students')
  @Roles('organization_admin')
  @ApiOperation({ summary: 'Remove multiple students from batch' })
  async removeStudentsFromBatch(
    @CurrentUser('organizationId') orgId: string,
    @Param('id', ParseUUIDPipe) batchId: string,
    @Body() dto: AddStudentsToBatchDto,
  ) {
    return this.batchService.removeStudentsFromBatch(batchId, dto.studentIds, orgId);
  }

  @Post(':id/teachers')
  @Roles('organization_admin')
  @ApiOperation({ summary: 'Add multiple teachers to batch' })
  async addTeachersToBatch(
    @CurrentUser('organizationId') orgId: string,
    @Param('id', ParseUUIDPipe) batchId: string,
    @Body() dto: AddTeachersToBatchDto,
  ) {
    return this.batchService.addTeachersToBatch(batchId, dto.teacherIds, orgId);
  }

  @Delete(':id/teachers')
  @Roles('organization_admin')
  @ApiOperation({ summary: 'Remove multiple teachers from batch' })
  async removeTeachersFromBatch(
    @CurrentUser('organizationId') orgId: string,
    @Param('id', ParseUUIDPipe) batchId: string,
    @Body() dto: AddTeachersToBatchDto,
  ) {
    return this.batchService.removeTeachersFromBatch(batchId, dto.teacherIds, orgId);
  }

  @Get(':id/stats')
  @Roles('organization_admin', 'teacher')
  @ApiOperation({ summary: 'Get batch statistics' })
  async getBatchStats(
    @CurrentUser('organizationId') orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.batchService.getBatchStats(id, orgId);
  }

  @Post(':id/archive')
  @Roles('organization_admin')
  @ApiOperation({ summary: 'Archive batch' })
  async archiveBatch(
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.batchService.archiveBatch(id, orgId, userId);
  }
}
