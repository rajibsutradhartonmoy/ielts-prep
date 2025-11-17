import { Module } from '@nestjs/common';
import { TestAssignmentController } from './test-assignment.controller';
import { TestAssignmentService } from './test-assignment.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [TestAssignmentController],
  providers: [TestAssignmentService],
  exports: [TestAssignmentService],
})
export class TestAssignmentModule {}
