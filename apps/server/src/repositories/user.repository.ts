import { prisma } from '@/utils/db';

export const UserRepository = {
  async findByEmployeeId(employeeId: string) {
    return prisma.user.findUnique({
      where: { employeeId },
      include: { config: true }
    });
  },

  async getConfig(userId: number) {
    return prisma.userConfig.findUnique({
      where: { userId }
    });
  },

  async updateConfig(userId: number, data: { expectedReturnRate?: number; plannedRetireAge?: number }) {
    return prisma.userConfig.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data
    });
  }
};