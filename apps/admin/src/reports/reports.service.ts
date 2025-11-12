import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class ReportsService {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: any,
    private readonly usersService: UsersService,
  ) {}

  async generateUserReport() {
    const cacheKey = 'user_report';
    const cachedReport = await this.redis.get(cacheKey);
    
    if (cachedReport) {
      return JSON.parse(cachedReport);
    }

    const stats = await this.usersService.getStats();
    const report = {
      title: 'User Statistics Report',
      generatedAt: new Date().toISOString(),
      data: stats,
    };

    await this.redis.setex(cacheKey, 300, JSON.stringify(report));
    return report;
  }

  async generateActivityReport() {
    return {
      title: 'User Activity Report',
      generatedAt: new Date().toISOString(),
      data: {
        activeUsers: 150,
        newUsers: 25,
        userRetention: 85.5,
      },
    };
  }
}