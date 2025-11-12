import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, Post } from '@nestjs-practice/shared';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 3306),
        username: configService.get('DB_USERNAME', 'nestjs_user'),
        password: configService.get('DB_PASSWORD', 'nestjs_password'),
        database: configService.get('DB_DATABASE', 'nestjs_db'),
        entities: [User, Post],
        synchronize: true,
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Post]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}