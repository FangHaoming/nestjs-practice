import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { ConsoleUtil, EnvUtil } from '../utils';

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
  private maxDays = 30; // 保留30天
  private maxFileSize = 20 * 1024 * 1024; // 20MB

  constructor() {
    // 确保日志目录存在
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }

    // 启动时清理旧日志
    this.cleanOldLogs();
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
   * 格式：日期 | requestId | method | url | code | delay | payload | response | error
   */
  private formatLogLine(logData: LogData): string {
    const parts = [
      logData.date || new Date().toISOString(),
      logData.requestId || 'unknown',
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
      const date = new Date();
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
      const filename = `${type}-${dateStr}.log`;
      const filepath = path.join(this.logsDir, filename);

      // 检查文件大小，如果超过限制则轮转
      if (fs.existsSync(filepath)) {
        const stats = fs.statSync(filepath);
        if (stats.size > this.maxFileSize) {
          // 重命名当前文件，添加时间戳
          const timestamp = date.toISOString().replace(/[:.]/g, '-');
          const rotatedFilename = `${type}-${dateStr}-${timestamp}.log`;
          const rotatedFilepath = path.join(this.logsDir, rotatedFilename);
          fs.renameSync(filepath, rotatedFilepath);
        }
      }

      // 追加日志到文件
      fs.appendFileSync(filepath, logLine + '\n', 'utf8');
    } catch (error) {
      // 如果写入失败，至少输出到控制台
      ConsoleUtil.error('Failed to write log:', error);
      ConsoleUtil.error('Log line:', logLine);
    }
  }

  /**
   * 清理旧日志（超过30天）
   */
  private cleanOldLogs(): void {
    try {
      const files = fs.readdirSync(this.logsDir);
      const now = Date.now();
      const maxAge = this.maxDays * 24 * 60 * 60 * 1000; // 30天的毫秒数

      files.forEach(file => {
        const filepath = path.join(this.logsDir, file);
        const stats = fs.statSync(filepath);

        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filepath);
          ConsoleUtil.log(`Deleted old log file: ${file}`);
        }
      });
    } catch (error) {
      ConsoleUtil.error('Failed to clean old logs:', error);
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
    const logLine = `[${new Date().toISOString()}] [INFO] ${message} ${optionalParams.length ? JSON.stringify(optionalParams) : ''}`;
    this.writeLog('application', logLine);
    ConsoleUtil.log(logLine);
  }

  error(message: any, ...optionalParams: any[]): void {
    const logLine = `[${new Date().toISOString()}] [ERROR] ${message} ${optionalParams.length ? JSON.stringify(optionalParams) : ''}`;
    this.writeLog('error', logLine);
    ConsoleUtil.error(logLine);
  }

  warn(message: any, ...optionalParams: any[]): void {
    const logLine = `[${new Date().toISOString()}] [WARN] ${message} ${optionalParams.length ? JSON.stringify(optionalParams) : ''}`;
    this.writeLog('application', logLine);
    ConsoleUtil.warn(logLine);
  }

  debug(message: any, ...optionalParams: any[]): void {
    const logLine = `[${new Date().toISOString()}] [DEBUG] ${message} ${optionalParams.length ? JSON.stringify(optionalParams) : ''}`;
    if (EnvUtil.isDevelopment()) {
      this.writeLog('application', logLine);
    }
    ConsoleUtil.debug(logLine);
  }

  verbose(message: any, ...optionalParams: any[]): void {
    const logLine = `[${new Date().toISOString()}] [VERBOSE] ${message} ${optionalParams.length ? JSON.stringify(optionalParams) : ''}`;
    if (EnvUtil.isDevelopment()) {
      this.writeLog('application', logLine);
    }
    ConsoleUtil.log(logLine);
  }
}
