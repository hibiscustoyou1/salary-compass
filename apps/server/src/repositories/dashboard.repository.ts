import { prisma } from '@/utils/db';

export const DashboardRepository = {
  /**
   * 获取指定年度的所有薪资记录 (个人模式)
   * 直接按年份查询，无需人员编码
   */
  async findByYear(year: number) {
    return await prisma.salaryRecord.findMany({
      where: {
        year: year
      },
      orderBy: {
        month: 'asc'
      }
    });
  },

  /**
   * 获取最近的一条记录 (个人模式)
   * 直接全表查最新
   */
  async findLatest() {
    return await prisma.salaryRecord.findFirst({
      orderBy: [
        { year: 'desc' },
        { month: 'desc' }
      ]
    });
  }
};