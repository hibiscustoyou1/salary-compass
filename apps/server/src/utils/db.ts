import { PrismaClient } from '@prisma/client';

// 避免开发环境下热重载导致连接数耗尽
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['query', 'error', 'warn'], // 方便调试 SQL
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;