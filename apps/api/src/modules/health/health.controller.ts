import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { DatabaseHealthIndicator } from './indicators/database.health';
import { RedisHealthIndicator } from './indicators/redis.health';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private database: DatabaseHealthIndicator,
    private redis: RedisHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Overall health check' })
  @ApiResponse({ status: 200, description: 'Health check successful' })
  @ApiResponse({ status: 503, description: 'Service unhealthy' })
  check() {
    return this.health.check([
      () => this.database.isHealthy('database'),
      () => this.redis.isHealthy('redis'),
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024), // 300MB
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024), // 300MB
      () => this.disk.checkStorage('storage', { path: '/', thresholdPercent: 0.9 }),
    ]);
  }

  @Public()
  @Get('database')
  @HealthCheck()
  @ApiOperation({ summary: 'Database health check' })
  @ApiResponse({ status: 200, description: 'Database is healthy' })
  @ApiResponse({ status: 503, description: 'Database is unhealthy' })
  checkDatabase() {
    return this.health.check([() => this.database.isHealthy('database')]);
  }

  @Public()
  @Get('redis')
  @HealthCheck()
  @ApiOperation({ summary: 'Redis health check' })
  @ApiResponse({ status: 200, description: 'Redis is healthy' })
  @ApiResponse({ status: 503, description: 'Redis is unhealthy' })
  checkRedis() {
    return this.health.check([() => this.redis.isHealthy('redis')]);
  }

  @Public()
  @Get('memory')
  @HealthCheck()
  @ApiOperation({ summary: 'Memory health check' })
  @ApiResponse({ status: 200, description: 'Memory usage is healthy' })
  @ApiResponse({ status: 503, description: 'Memory usage is unhealthy' })
  checkMemory() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),
    ]);
  }

  @Public()
  @Get('liveness')
  @HealthCheck()
  @ApiOperation({ summary: 'Liveness probe for Kubernetes' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  checkLiveness() {
    // Basic liveness check - just returns if the app is running
    return {
      status: 'ok',
      info: { liveness: { status: 'up' } },
      error: {},
      details: { liveness: { status: 'up' } },
    };
  }

  @Public()
  @Get('readiness')
  @HealthCheck()
  @ApiOperation({ summary: 'Readiness probe for Kubernetes' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  @ApiResponse({ status: 503, description: 'Service is not ready' })
  checkReadiness() {
    // Readiness check - checks if app is ready to handle requests
    return this.health.check([
      () => this.database.isHealthy('database'),
      () => this.redis.isHealthy('redis'),
    ]);
  }
}
