import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthenticatedRequest } from '../../common/types/request.types';
import { NotificationService } from './notification.service';
import { SendEmailDto, SendBulkEmailDto } from './dto/notification.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('send-email')
  @Roles('organization_admin')
  async sendEmail(@Request() req: AuthenticatedRequest, @Body() dto: SendEmailDto) {
    const result = await this.notificationService.sendEmail(
      dto.to,
      dto.subject,
      dto.template,
      dto.context,
    );

    return { success: result };
  }

  @Post('send-bulk-email')
  @Roles('organization_admin')
  async sendBulkEmail(@Request() req: AuthenticatedRequest, @Body() dto: SendBulkEmailDto) {
    const result = await this.notificationService.sendBulkEmail(
      dto.recipients,
      dto.subject,
      dto.template,
      dto.context,
    );

    return result;
  }
}
