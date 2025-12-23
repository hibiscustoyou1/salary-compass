// 文件: scripts/vault.ts
import * as fs from 'fs';
import * as crypto from 'crypto';
import * as path from 'path';
import { getServerPaths } from '@repo/shared/server';

// ==========================================
// 配置区域
// ==========================================
// 使用 AES-256-GCM (现代标准，自带完整性校验)
const ALGORITHM = 'aes-256-gcm';
// 从环境变量获取密码，严禁硬编码默认值
const PASSWORD = process.env.VAULT_PASS;

// 获取路径
const { PROJECT_ROOT } = getServerPaths(__dirname);
const envPath = path.resolve(PROJECT_ROOT, '.env');
const encPath = path.resolve(PROJECT_ROOT, '.env.enc');

// ==========================================
// 工具函数
// ==========================================

/**
 * 检查密码是否存在
 */
function checkPasswordOrExit(): string {
  if (!PASSWORD) {
    console.error('\n❌ 安全错误: 未设置环境变量 VAULT_PASS');
    console.error('👉 请运行: VAULT_PASS=你的强密码 pnpm vault:enc \n');
    process.exit(1);
  }
  return PASSWORD;
}

/**
 * 派生密钥 (PBKDF2 / Scrypt)
 * @param password 密码
 * @param salt 随机盐
 */
function deriveKey(password: string, salt: Buffer): Buffer {
  // scrypt 比 pbkdf2 更难被 GPU/ASIC 暴力破解
  // 32 bytes = 256 bits
  return crypto.scryptSync(password, salt, 32);
}

// ==========================================
// 核心逻辑
// ==========================================

function encrypt() {
  const password = checkPasswordOrExit();
  
  if (!fs.existsSync(envPath)) {
    console.error(`❌ 错误：未找到源文件 ${envPath}`);
    process.exit(1);
  }
  
  const content = fs.readFileSync(envPath, 'utf8');
  
  // 1. 生成随机盐 (32 bytes) 和 随机 IV (12 bytes for GCM)
  // 每次加密都必须不同，防止彩虹表和模式分析
  const salt = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);
  
  // 2. 派生密钥
  const key = deriveKey(password, salt);
  
  // 3. 创建加密器
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  // 4. 加密
  let encrypted = cipher.update(content, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // 5. 获取认证标签 (Auth Tag) - GCM 特性，防止文件被篡改
  const authTag = cipher.getAuthTag();
  
  // 6. 拼接存储: salt:iv:authTag:encryptedContent
  // 我们将所有元数据都保存下来，以便解密时使用
  const payload = [
    salt.toString('hex'),
    iv.toString('hex'),
    authTag.toString('hex'),
    encrypted
  ].join(':');
  
  fs.writeFileSync(encPath, payload);
  console.log(`🔒 加密成功 (AES-256-GCM): .env -> .env.enc`);
  console.log(`📦 输出包含: 随机Salt + 随机IV + 完整性校验Tag + 密文`);
}

function decrypt() {
  const password = checkPasswordOrExit();
  
  if (!fs.existsSync(encPath)) {
    console.error(`❌ 错误：未找到加密文件 ${encPath}`);
    process.exit(1);
  }
  
  const fileContent = fs.readFileSync(encPath, 'utf8');
  
  // 1. 解析 payload
  const parts = fileContent.split(':');
  if (parts.length !== 4) {
    console.error('❌ 解密失败：文件格式错误或版本不兼容。');
    process.exit(1);
  }
  
  const [saltHex, ivHex, authTagHex, encryptedContent] = parts;
  
  // 2. 还原 Buffer
  const salt = Buffer.from(saltHex, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  // 3. 重新派生密钥 (必须用加密时同样的 Salt)
  const key = deriveKey(password, salt);
  
  // 4. 创建解密器
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  
  // 5. 设置认证标签 (GCM 核心：如果被篡改，这一步或 final 会抛出错误)
  decipher.setAuthTag(authTag);
  
  try {
    // 6. 解密
    let decrypted = decipher.update(encryptedContent, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    fs.writeFileSync(envPath, decrypted);
    console.log(`🔓 解密成功：.env.enc -> .env`);
  } catch (error) {
    console.error('❌ 解密失败：密码错误 或 文件内容已被篡改！');
    process.exit(1);
  }
}

// ==========================================
// 入口
// ==========================================

function main() {
  const action = process.argv[2];
  
  switch (action) {
    case 'encrypt':
      encrypt();
      break;
    case 'decrypt':
      decrypt();
      break;
    default:
      console.log('🛡️  Secure Vault Script');
      console.log('用法:');
      console.log('  encrypt: VAULT_PASS=xxx npx tsx scripts/vault.ts encrypt');
      console.log('  decrypt: VAULT_PASS=xxx npx tsx scripts/vault.ts decrypt');
      process.exit(1);
  }
}

main();
