import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from '../services/logger.service';
import { IApiResponse } from '../interfaces/common.interface';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger: LoggerService;

  constructor() {
    this.logger = new LoggerService();
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip, body, query, params } = request;
    const userAgent = request.get('User-Agent') || '';
    const requestId = request['requestId'] || 'unknown';
    const now = Date.now();
    const timestamp = new Date().toISOString();

    // 合并请求参数
    const payload = {
      ...(body && Object.keys(body).length > 0 && { body }),
      ...(query && Object.keys(query).length > 0 && { query }),
      ...(params && Object.keys(params).length > 0 && { params }),
    };

    // 记录请求日志
    this.logger.logRequest({
      date: timestamp,
      requestId,
      method,
      url,
      payload: Object.keys(payload).length > 0 ? payload : undefined,
      ip,
      userAgent,
    });

    return next.handle().pipe(
      tap((data: IApiResponse) => {
        const response = context.switchToHttp().getResponse();
        // 从接口响应中获取 code，如果没有则使用 HTTP statusCode
        const code = data?.code || response.statusCode || 200;
        const delay = Date.now() - now;
        const finalRequestId = data?.requestId || requestId;
        
        // 记录响应日志
        this.logger.logResponse({
          date: new Date().toISOString(),
          requestId: finalRequestId,
          method,
          url,
          code,
          delay,
          response: data,
        });
      }),
    );
  }
}