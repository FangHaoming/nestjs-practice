import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as path from 'path';
import * as winston from 'winston';
import * as DailyRotateFileModule from 'winston-daily-rotate-file';
import { ConsoleUtil, EnvUtil, DateUtil } from '../utils';

// 处理 CommonJS 默认导出
const DailyRotateFile = (DailyRotateFileModule as any).default || DailyRotateFileModule;

export interface LogData {
  date: string;
  requestId: string;
  method: string;
  url: string;
  code?: number;
  delay?: number;
  payload?: any;
  response?: any;
  error?: string;
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class LoggerService implements NestLoggerService {
  private logsDir = path.join(process.cwd(), 'logs');
  private maxSize = '20m'; // 20MB
  private maxFiles = '30d'; // 保留30天的日志文件
  private applicationLogger: winston.Logger;
  private errorLogger: winston.Logger;

  constructor() {
    // 创建日志格式（直接输出消息，因为时间已经在 formatLogLine 中格式化）
    const logFormat = winston.format.printf(({ message }) => {
      return message as string;
    });

    const applicationTransport = new DailyRotateFile({
      filename: path.join(this.logsDir, 'application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: this.maxSize,
      maxFiles: this.maxFiles,
      format: logFormat,
      utc: false, // 使用服务器本地时间
      createSymlink: false,
      zippedArchive: false,
    });

    const errorTransport = new DailyRotateFile({
      filename: path.join(this.logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: this.maxSize,
      maxFiles: this.maxFiles,
      level: 'error',
      format: logFormat,
      utc: false, // 使用服务器本地时间
      createSymlink: false,
      zippedArchive: false,
    });

    // 创建应用日志记录器
    this.applicationLogger = winston.createLogger({
      transports: [applicationTransport],
    });

    // 创建错误日志记录器
    this.errorLogger = winston.createLogger({
      transports: [errorTransport],
    });
  }

  /**
   * 记录请求日志
   */
  logRequest(logData: LogData): void {
    const logLine = this.formatLogLine(logData);
    this.writeLog('application', logLine);
    ConsoleUtil.log(logLine);
  }

  /**
   * 记录响应日志
   */
  logResponse(logData: LogData): void {
    const logLine = this.formatLogLine(logData);
    this.writeLog('application', logLine);
    ConsoleUtil.log(logLine);
  }

  /**
   * 记录错误日志
   */
  logError(logData: LogData): void {
    const logLine = this.formatLogLine(logData);
    this.writeLog('error', logLine);
    this.writeLog('application', logLine);
    ConsoleUtil.error(logLine);
  }

  /**
   * 格式化日志行
   * 格式：[日期] | [requestId] | method | url | code | delay | payload | response | error
   */
  private formatLogLine(logData: LogData): string {
    const dateStr = logData.date 
      ? DateUtil.formatDate(logData.date) 
      : DateUtil.formatDate(new Date());
    
    const parts = [
      `[${dateStr}]`,
      `[${logData.requestId || 'unknown'}]`,
      logData.method || '-',
      logData.url || '-',
      logData.code !== undefined ? String(logData.code) : '-',
      logData.delay !== undefined ? `${logData.delay}ms` : '-',
    ];

    // 添加 payload（如果有）
    if (logData.payload !== undefined && logData.payload !== null) {
      const payloadStr = this.sanitizeData(logData.payload);
      parts.push(`payload:${payloadStr}`);
    }

    // 添加 response（如果有）
    if (logData.response !== undefined && logData.response !== null) {
      const responseStr = this.sanitizeData(logData.response);
      parts.push(`response:${responseStr}`);
    }

    // 添加 error（如果有）
    if (logData.error) {
      parts.push(`error:${logData.error}`);
    }

    return parts.join(',');
  }

  /**
   * 写入日志文件
   */
  private writeLog(type: 'application' | 'error', logLine: string): void {
    try {
      if (type === 'error') {
        this.errorLogger.error(logLine);
      } else {
        this.applicationLogger.info(logLine);
      }
    } catch (error) {
      // 如果写入失败，至少输出到控制台
      ConsoleUtil.error('Failed to write log:', error);
      ConsoleUtil.error('Log line:', logLine);
    }
  }

  /**
   * 清理敏感数据（如密码）
   */
  private sanitizeData(data: any): string {
    if (data === null || data === undefined) {
      return 'null';
    }

    if (typeof data === 'string') {
      // 限制字符串长度，避免日志过大
      return data.length > 500 ? data.substring(0, 500) + '...' : data;
    }

    if (typeof data === 'object') {
      const sanitized = { ...data };
      // 移除敏感字段
      const sensitiveFields = ['password', 'token', 'authorization', 'cookie', 'access_token', 'refresh_token'];
      sensitiveFields.forEach(field => {
        if (sanitized[field]) {
          sanitized[field] = '***';
        }
        // 递归处理嵌套对象
        Object.keys(sanitized).forEach(key => {
          if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
            sensitiveFields.forEach(sensitiveField => {
              if (sanitized[key][sensitiveField]) {
                sanitized[key][sensitiveField] = '***';
              }
            });
          }
        });
      });

      const jsonStr = JSON.stringify(sanitized);
      // 限制 JSON 长度
      return jsonStr.length > 1000 ? jsonStr.substring(0, 1000) + '...' : jsonStr;
    }

    const str = String(data);
    return str.length > 500 ? str.substring(0, 500) + '...' : str;
  }

  // NestJS LoggerService 接口实现
  log(message: any, ...optionalParams: any[]): void {
    const logLine = `[${DateUtil.formatDate(new Date())}] [INFO] ${message} ${optionalParams.length ? JSON.stringify(optionalParams) : ''}`;
    this.writeLog('application', logLine);
    ConsoleUtil.log(logLine);
  }

  error(message: any, ...optionalParams: any[]): void {
    const logLine = `[${DateUtil.formatDate(new Date())}] [ERROR] ${message} ${optionalParams.length ? JSON.stringify(optionalParams) : ''}`;
    this.writeLog('error', logLine);
    ConsoleUtil.error(logLine);
  }

  warn(message: any, ...optionalParams: any[]): void {
    const logLine = `[${DateUtil.formatDate(new Date())}] [WARN] ${message} ${optionalParams.length ? JSON.stringify(optionalParams) : ''}`;
    this.writeLog('application', logLine);
    ConsoleUtil.warn(logLine);
  }

  debug(message: any, ...optionalParams: any[]): void {
    const logLine = `[${DateUtil.formatDate(new Date())}] [DEBUG] ${message} ${optionalParams.length ? JSON.stringify(optionalParams) : ''}`;
    if (EnvUtil.isDevelopment()) {
      this.writeLog('application', logLine);
    }
    ConsoleUtil.debug(logLine);
  }

  verbose(message: any, ...optionalParams: any[]): void {
    const logLine = `[${DateUtil.formatDate(new Date())}] [VERBOSE] ${message} ${optionalParams.length ? JSON.stringify(optionalParams) : ''}`;
    if (EnvUtil.isDevelopment()) {
      this.writeLog('application', logLine);
    }
    ConsoleUtil.log(logLine);
  }
}
