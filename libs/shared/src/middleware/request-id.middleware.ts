import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

/**
 * RequestId 中间件
 * 为每个请求生成唯一的 requestId，并添加到请求头中
 * 方便追踪和排查问题
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  // 从请求头获取 requestId，如果没有则生成新的
  const requestId = req.headers['x-request-id'] as string || randomUUID();
  
  // 将 requestId 添加到请求对象和响应头中
  req['requestId'] = requestId;
  res.setHeader('X-Request-Id', requestId);
  
  next();
}

