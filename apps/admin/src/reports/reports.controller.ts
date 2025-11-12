import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard, Roles } from '@nestjs-practice/auth';

@Controller('admin/reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('users')
  @Roles('admin')
  async getUserReport() {
    return this.reportsService.generateUserReport();
  }

  @Get('activity')
  @Roles('admin')
  async getActivityReport() {
    return this.reportsService.generateActivityReport();
  }
}