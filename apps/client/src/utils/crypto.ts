export async function sha256(message: string): Promise<string> {
  // 将字符串转为 Uint8Array
  const msgUint8 = new TextEncoder().encode(message);
  // 计算 Hash (返回 ArrayBuffer)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  // 将 ArrayBuffer 转为 Hex 字符串
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
