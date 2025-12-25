import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { getServerPaths } from "@repo/shared/server";

const { PROJECT_ROOT } = getServerPaths(__dirname);
const logDir = path.join(PROJECT_ROOT, 'logs');

// 定义日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, source, stack }) => {
    // 统一格式: [时间] [来源] [级别]: 内容
    const src = source ? `[${source}]` : '[Server]';
    const stackMsg = stack ? `\nStack: ${stack}` : '';
    return `${timestamp} ${src} ${level.toUpperCase()}: ${message}${stackMsg}`;
  })
);

export const logger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    // 1. 输出到控制台 (带颜色)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      ),
    }),
    // 2. 错误日志 (只记录 error)
    new DailyRotateFile({
      dirname: logDir,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m', // 单个文件最大 20MB
      maxFiles: '14d', // 保留 14 天
    }),
    // 3. 组合日志 (记录所有 info 以上)
    new DailyRotateFile({
      dirname: logDir,
      filename: 'combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
});
