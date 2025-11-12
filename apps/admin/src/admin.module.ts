import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { DatabaseModule, CacheModule } from '@nestjs-practice/database';
import { AuthModule } from '@nestjs-practice/auth';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    CacheModule,
    AuthModule,
    UsersModule,
    ReportsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
