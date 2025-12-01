/**
 * 环境工具类
 */
export class EnvUtil {
  /**
   * 检查是否为开发环境
   */
  static isDevelopment(): boolean {
    return process.env.NODE_ENV !== 'production';
  }

  /**
   * 检查是否为生产环境
   */
  static isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  /**
   * 检查是否为测试环境
   */
  static isTest(): boolean {
    return process.env.NODE_ENV === 'test';
  }

  /**
   * 获取当前环境
   */
  static getEnv(): string {
    return process.env.NODE_ENV || 'development';
  }
}

