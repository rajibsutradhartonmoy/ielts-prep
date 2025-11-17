import {
  Controller,
  Post,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Body,
  Param,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { FileUploadService } from './file-upload.service';
import { AuthenticatedRequest } from '../../common/types/request.types';

@Controller('file-upload')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('image')
  @Roles('organization_admin', 'teacher')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Request() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    return this.fileUploadService.uploadFile(
      file,
      req.user.organizationId,
      'image',
    );
  }

  @Post('audio')
  @Roles('organization_admin', 'teacher')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAudio(
    @Request() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    return this.fileUploadService.uploadTestAudio(file, req.user.organizationId);
  }

  @Post('video')
  @Roles('organization_admin', 'teacher')
  @UseInterceptors(FileInterceptor('file'))
  async uploadVideo(
    @Request() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    return this.fileUploadService.uploadFile(
      file,
      req.user.organizationId,
      'video',
    );
  }

  @Post('document')
  @Roles('organization_admin', 'teacher')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Request() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    return this.fileUploadService.uploadFile(
      file,
      req.user.organizationId,
      'document',
    );
  }

  @Post('multiple')
  @Roles('organization_admin', 'teacher')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultipleFiles(
    @Request() req: AuthenticatedRequest,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('type') type: 'image' | 'audio' | 'video' | 'document',
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }
    return this.fileUploadService.uploadMultipleFiles(
      files,
      req.user.organizationId,
      type || 'document',
    );
  }

  @Post('organization-logo')
  @Roles('organization_admin')
  @UseInterceptors(FileInterceptor('file'))
  async uploadOrganizationLogo(
    @Request() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    return this.fileUploadService.uploadOrganizationLogo(
      file,
      req.user.organizationId,
    );
  }

  @Post('csv')
  @Roles('organization_admin')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAndParseCSV(
    @Request() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const uploadedFile = await this.fileUploadService.uploadCSV(
      file,
      req.user.organizationId,
    );

    const parsedData = await this.fileUploadService.parseCSV(uploadedFile.path);

    return {
      file: uploadedFile,
      data: parsedData,
      rowCount: parsedData.length,
    };
  }

  @Delete(':filePath')
  @Roles('organization_admin', 'teacher')
  async deleteFile(@Param('filePath') filePath: string) {
    const success = await this.fileUploadService.deleteFile(filePath);
    return { success };
  }
}
