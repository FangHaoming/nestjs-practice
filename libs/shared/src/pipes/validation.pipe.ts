import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export class CustomValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const errors = validationErrors.map(error => ({
          field: error.property,
          errors: Object.values(error.constraints || {}),
        }));
        
        return new BadRequestException({
          message: 'Validation failed',
          data: errors,
        });
      },
    });
  }
}
