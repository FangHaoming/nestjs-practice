import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { IApiResponse } from '@nestjs-practice/shared';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const requestId = request['requestId'] || 'unknown';

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
      timestamp: new Date().toISOString(),
      requestId,
      ...(errorData && { data: errorData }),
    };

    // 在错误日志中也打印 requestId
    console.error(`[${new Date().toISOString()}] [${requestId}] Error: ${message} - ${status}`);

    response.status(status).json(errorResponse);
  }
}