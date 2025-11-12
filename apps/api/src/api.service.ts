import { Injectable } from '@nestjs/common';

@Injectable()
export class ApiService {
  getHello(): string {
    return 'Welcome to NestJS Monorepo API!';
  }

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      service: 'api',
    };
  }
}
