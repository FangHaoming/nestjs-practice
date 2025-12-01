import { EnvUtil } from './env.util';

/**
 * 控制台输出工具类
 */
export class ConsoleUtil {
  /**
   * 内部方法：通过解构参数调用对应的 console 方法
   */
  private static output(
    method: (...args: any[]) => void,
    ...args: any[]
  ): void {
    if (!EnvUtil.isDevelopment()) {
      return;
    }
    method(...args);
  }

  /**
   * 输出普通日志到控制台（仅在开发环境）
   * @param args 日志内容，支持多个参数
   */
  static log(...args: any[]): void {
    this.output(console.log, ...args);
  }

  /**
   * 输出错误日志到控制台（仅在开发环境）
   * @param args 日志内容，支持多个参数
   */
  static error(...args: any[]): void {
    this.output(console.error, ...args);
  }

  /**
   * 输出警告日志到控制台（仅在开发环境）
   * @param args 日志内容，支持多个参数
   */
  static warn(...args: any[]): void {
    this.output(console.warn, ...args);
  }

  /**
   * 输出调试日志到控制台（仅在开发环境）
   * @param args 日志内容，支持多个参数
   */
  static debug(...args: any[]): void {
    this.output(console.debug, ...args);
  }
}

