import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../services/logger.service';
import { IApiResponse } from '../interfaces/common.interface';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger: LoggerService;

  constructor() {
    this.logger = new LoggerService();
  }

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const { method, url, body, query, params } = request;
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const requestId = request['requestId'] || 'unknown';
    const timestamp = new Date().toISOString();

    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : null;
    
    let message = 'Internal server error';
    let errorData: any = undefined;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
      errorData = message;
    } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const responseObj = exceptionResponse as any;
      message = responseObj.message || responseObj.error || message;
      // 将 details、errors 或 error 合并到 data 字段
      errorData = responseObj.details || responseObj.errors || responseObj.error || message;
    }

    const errorResponse: IApiResponse = {
      success: false,
      message,
      code: status,
      timestamp,
      requestId,
      ...(errorData && { data: errorData }),
    };

    // 合并请求参数
    const payload = {
      ...(body && Object.keys(body).length > 0 && { body }),
      ...(query && Object.keys(query).length > 0 && { query }),
      ...(params && Object.keys(params).length > 0 && { params }),
    };

    // 记录错误日志
    this.logger.logError({
      date: timestamp,
      requestId,
      method,
      url,
      code: status,
      payload: Object.keys(payload).length > 0 ? payload : undefined,
      response: errorResponse,
      error: message,
    });

    response.status(status).json(errorResponse);
  }
}