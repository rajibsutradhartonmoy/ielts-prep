import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { DatabaseHealthIndicator } from './indicators/database.health';
import { RedisHealthIndicator } from './indicators/redis.health';
import { DatabaseModule } from '../../database/database.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    TerminusModule,
    DatabaseModule,
    BullModule.registerQueue({ name: 'email' }),
  ],
  controllers: [HealthController],
  providers: [DatabaseHealthIndicator, RedisHealthIndicator],
})
export class HealthModule {}
