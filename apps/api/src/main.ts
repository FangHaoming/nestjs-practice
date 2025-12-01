import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { 
  CustomValidationPipe, 
  LoggingInterceptor, 
  TransformInterceptor, 
  HttpExceptionFilter,
  requestIdMiddleware
} from '@nestjs-practice/shared';
import { ApiModule } from './api.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');

  // 注册 RequestId 中间件（必须在最前面）
  app.use(requestIdMiddleware);

  app.useGlobalPipes(new CustomValidationPipe());
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('NestJS Practice API')
    .setDescription('API documentation for NestJS Practice project')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get('PORT', 3000);
  await app.listen(port);
  
  console.log(`API Application is running on: http://localhost:${port}`);
  console.log(`API Health Check: http://localhost:${port}/api/v1/health`);
  console.log(`Swagger Documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
