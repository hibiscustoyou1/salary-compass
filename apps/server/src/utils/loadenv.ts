import path from 'path';
import dotenv from 'dotenv';
import { getServerPaths } from '@repo/shared/server';

// 获取项目路径
const { PROJECT_ROOT } = getServerPaths(__dirname);

// 加载环境变量
console.log('🔌 初始化环境变量...');
const result = dotenv.config({ path: path.resolve(PROJECT_ROOT, '.env') });

if (result.error) {
  console.warn('⚠️ 未找到 .env 文件，将使用系统环境变量或默认值');
} else {
  console.log('✅ 环境变量加载成功');
}
