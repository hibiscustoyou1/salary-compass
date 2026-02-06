import { prisma } from '@/utils/db';

export const SalaryRepository = {
  // 分页获取列表 (虽然是个人库，但分页是个好习惯)
  async findAll(page: number = 1, pageSize: number = 12) {
    const skip = (page - 1) * pageSize;
    const [total, items] = await prisma.$transaction([
      prisma.salaryRecord.count(),
      prisma.salaryRecord.findMany({
        orderBy: [
          { year: 'desc' },
          { month: 'desc' }
        ],
        skip,
        take: pageSize
      })
    ]);
    return { total, items };
  },

  // 获取单月详情 (通过联合主键)
  async findByPeriod(year: number, month: number) {
    return await prisma.salaryRecord.findUnique({
      where: {
        year_month: {
          year,
          month
        }
      }
    });
  }
};