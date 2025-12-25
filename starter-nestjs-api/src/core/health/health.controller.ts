/**
 * ===============================================
 * HEALTH CHECK CONTROLLER
 * Endpoints para monitoreo y health checks
 * ===============================================
 */

import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  /**
   * Health check básico
   * GET /health
   */
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Verifica conexión a base de datos
      () => this.db.pingCheck('database'),
      
      // Verifica memoria heap (max 150MB)
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      
      // Verifica memoria RSS (max 300MB)
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),
      
      // Verifica espacio en disco (min 50% libre)
      () =>
        this.disk.checkStorage('storage', {
          path: '/',
          thresholdPercent: 0.5,
        }),
    ]);
  }

  /**
   * Liveness probe (para Kubernetes)
   * GET /health/live
   */
  @Get('live')
  live() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Readiness probe (para Kubernetes)
   * GET /health/ready
   */
  @Get('ready')
  @HealthCheck()
  ready() {
    return this.health.check([
      () => this.db.pingCheck('database'),
    ]);
  }
}
