import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { 
  CustomValidationPipe, 
  LoggingInterceptor, 
  TransformInterceptor, 
  HttpExceptionFilter 
} from '@nestjs-practice/shared';
import { ApiModule } from './api.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(new CustomValidationPipe());
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = configService.get('PORT', 3000);
  await app.listen(port);
  
  console.log(`API Application is running on: http://localhost:${port}`);
  console.log(`API Health Check: http://localhost:${port}/health`);
}
bootstrap();
