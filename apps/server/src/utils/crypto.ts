import crypto from 'crypto';

/**
 * 计算字符串的 SHA-256 哈希值
 */
export function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}
