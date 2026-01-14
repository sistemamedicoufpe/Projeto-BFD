import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'neurocare-api',
      version: process.env.npm_package_version || '1.0.0',
    };
  }

  async detailedCheck() {
    const checks = {
      api: 'ok',
      database: 'unknown',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };

    // Check database connection
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = 'ok';
    } catch (error) {
      checks.database = 'error';
    }

    const allHealthy = checks.api === 'ok' && checks.database === 'ok';

    return {
      status: allHealthy ? 'healthy' : 'degraded',
      checks,
    };
  }
}
