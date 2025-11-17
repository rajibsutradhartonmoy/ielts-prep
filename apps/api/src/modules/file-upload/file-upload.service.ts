import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs/promises';

export interface UploadedFile {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  path: string;
}

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);
  private readonly uploadDir: string;
  private readonly maxFileSize: number;
  private readonly allowedMimeTypes: string[];

  constructor(private readonly configService: ConfigService) {
    this.uploadDir = this.configService.get('UPLOAD_DIR', './uploads');
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'audio/mpeg',
      'audio/wav',
      'audio/mp3',
      'video/mp4',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
    ];
  }

  async uploadFile(
    file: Express.Multer.File,
    organizationId: string,
    type: 'image' | 'audio' | 'video' | 'document' = 'document',
  ): Promise<UploadedFile> {
    // Validate file
    this.validateFile(file);

    // Generate unique filename
    const filename = this.generateFilename(file.originalname);
    const uploadPath = path.join(
      this.uploadDir,
      organizationId,
      type,
      filename,
    );

    // Ensure directory exists
    await this.ensureDirectoryExists(path.dirname(uploadPath));

    // Save file
    await fs.writeFile(uploadPath, file.buffer);

    // Generate URL
    const url = `/uploads/${organizationId}/${type}/${filename}`;

    this.logger.log(`File uploaded: ${url}`);

    return {
      filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url,
      path: uploadPath,
    };
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    organizationId: string,
    type: 'image' | 'audio' | 'video' | 'document' = 'document',
  ): Promise<UploadedFile[]> {
    return Promise.all(
      files.map((file) => this.uploadFile(file, organizationId, type)),
    );
  }

  async deleteFile(filePath: string): Promise<boolean> {
    try {
      await fs.unlink(filePath);
      this.logger.log(`File deleted: ${filePath}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete file: ${filePath}`, error);
      return false;
    }
  }

  async getFileStats(filePath: string) {
    try {
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
      };
    } catch (error) {
      throw new BadRequestException('File not found');
    }
  }

  private validateFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed (${this.maxFileSize / 1024 / 1024}MB)`,
      );
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type not allowed: ${file.mimetype}`,
      );
    }
  }

  private generateFilename(originalName: string): string {
    const ext = path.extname(originalName);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${random}${ext}`;
  }

  private async ensureDirectoryExists(dir: string) {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  // Helper methods for specific file types
  async uploadTestAudio(
    file: Express.Multer.File,
    organizationId: string,
  ): Promise<UploadedFile> {
    if (!file.mimetype.startsWith('audio/')) {
      throw new BadRequestException('File must be an audio file');
    }
    return this.uploadFile(file, organizationId, 'audio');
  }

  async uploadTestImage(
    file: Express.Multer.File,
    organizationId: string,
  ): Promise<UploadedFile> {
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('File must be an image file');
    }
    return this.uploadFile(file, organizationId, 'image');
  }

  async uploadOrganizationLogo(
    file: Express.Multer.File,
    organizationId: string,
  ): Promise<UploadedFile> {
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Logo must be an image file');
    }

    // Additional validation for logo dimensions could be added here
    return this.uploadFile(file, organizationId, 'image');
  }

  // Bulk import helpers
  async uploadCSV(
    file: Express.Multer.File,
    organizationId: string,
  ): Promise<UploadedFile> {
    if (file.mimetype !== 'text/csv' && !file.originalname.endsWith('.csv')) {
      throw new BadRequestException('File must be a CSV file');
    }
    return this.uploadFile(file, organizationId, 'document');
  }

  async parseCSV(filePath: string): Promise<any[]> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      const headers = lines[0].split(',').map((h) => h.trim());

      const data = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        const values = lines[i].split(',').map((v) => v.trim());
        const row: any = {};

        headers.forEach((header, index) => {
          row[header] = values[index];
        });

        data.push(row);
      }

      return data;
    } catch (error) {
      throw new BadRequestException('Failed to parse CSV file');
    }
  }
}
