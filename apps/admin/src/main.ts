import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { 
  CustomValidationPipe, 
  LoggingInterceptor, 
  TransformInterceptor, 
  HttpExceptionFilter 
} from '@nestjs-practice/shared';
import { AdminModule } from './admin.module';

async function bootstrap() {
  const app = await NestFactory.create(AdminModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('admin/v1');

  app.useGlobalPipes(new CustomValidationPipe());
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = configService.get('PORT', 3001);
  await app.listen(port);
  
  console.log(`Admin Application is running on: http://localhost:${port}`);
  console.log(`Admin Health Check: http://localhost:${port}/health`);
}
bootstrap();
