/**
 * 日期时间工具类
 */
export class DateUtil {
  /**
   * 格式化日期时间（精确到秒）
   * @param date Date 对象或 ISO 字符串
   * @param timezone 时区偏移（小时），可选。例如：8 表示 UTC+8（北京时间），-5 表示 UTC-5
   *                 如果不提供，则使用服务器本地时间
   * @returns 格式：YYYY-MM-DDTHH:mm:ss
   */
  static formatDate(date: Date | string, timezone?: number): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    let year: number, month: string, day: string, hours: string, minutes: string, seconds: string;
    
    if (timezone !== undefined) {
      // 如果指定了时区，计算目标时区的时间
      // 获取 UTC 时间戳，然后加上时区偏移
      const utcTime = dateObj.getTime() + (dateObj.getTimezoneOffset() * 60 * 1000);
      const targetTime = utcTime + (timezone * 60 * 60 * 1000);
      const targetDate = new Date(targetTime);
      year = targetDate.getUTCFullYear();
      month = String(targetDate.getUTCMonth() + 1).padStart(2, '0');
      day = String(targetDate.getUTCDate()).padStart(2, '0');
      hours = String(targetDate.getUTCHours()).padStart(2, '0');
      minutes = String(targetDate.getUTCMinutes()).padStart(2, '0');
      seconds = String(targetDate.getUTCSeconds()).padStart(2, '0');
    } else {
      // 使用服务器本地时间
      year = dateObj.getFullYear();
      month = String(dateObj.getMonth() + 1).padStart(2, '0');
      day = String(dateObj.getDate()).padStart(2, '0');
      hours = String(dateObj.getHours()).padStart(2, '0');
      minutes = String(dateObj.getMinutes()).padStart(2, '0');
      seconds = String(dateObj.getSeconds()).padStart(2, '0');
    }
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }
}

