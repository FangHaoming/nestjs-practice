import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IApiResponse } from '@nestjs-practice/shared';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip } = request;
    const userAgent = request.get('User-Agent') || '';
    const requestId = request['requestId'] || 'unknown';
    const now = Date.now();

    console.log(`[${new Date().toISOString()}] [${requestId}] ${method} ${url} - ${ip} ${userAgent}`);

    return next.handle().pipe(
      tap((data: IApiResponse) => {
        const response = context.switchToHttp().getResponse();
        // 从接口响应中获取 code，如果没有则使用 HTTP statusCode
        const code = data?.code || response.statusCode || 200;
        const delay = Date.now() - now;
        const finalRequestId = data?.requestId || requestId;
        
        console.log(`[${new Date().toISOString()}] [${finalRequestId}] ${method} ${url} - ${code} - ${delay}ms`);
      }),
    );
  }
}