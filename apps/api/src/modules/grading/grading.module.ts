import { Module } from '@nestjs/common';
import { GradingController } from './grading.controller';
import { GradingService } from './grading.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [GradingController],
  providers: [GradingService],
  exports: [GradingService],
})
export class GradingModule {}
