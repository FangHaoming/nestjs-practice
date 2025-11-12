import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthModule as LibraryAuthModule } from '@nestjs-practice/auth';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [LibraryAuthModule, UsersModule],
  controllers: [AuthController],
})
export class AuthModule {}