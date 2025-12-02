import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IApiResponse } from '../interfaces/common.interface';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, IApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<IApiResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    const statusCode = response.statusCode || 200;
    const requestId = request['requestId'] || 'unknown';

    return next.handle().pipe(
      map(data => ({
        success: true,
        message: 'success',
        code: statusCode,
        timestamp: new Date().toISOString(),
        requestId,
        data,
      })),
    );
  }
}