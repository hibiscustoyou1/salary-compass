import { sha256 as jsSha256 } from 'js-sha256';

/**
 * 计算 SHA-256 哈希值
 * 使用 js-sha256 库以支持非 HTTPS 环境 (如 HTTP 局域网 IP)
 * @param message 明文字符串
 * @returns 64位 Hex 字符串
 */
export async function sha256(message: string): Promise<string> {
  return jsSha256(message);
}
