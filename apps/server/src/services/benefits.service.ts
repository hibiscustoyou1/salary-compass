import { DashboardRepository } from '@/repositories/dashboard.repository';
// 复用 DashboardRepository 查全量数据，无需新建 Repository

export const BenefitsService = {
  async getPrediction() {
    const currentYear = new Date().getFullYear();

    // 1. 获取全量历史数据 (为了计算累计余额)
    // 既然是个人库，我们可以直接查所有年份，或者按需查最近N年
    // 这里为了简单，假设 DashboardRepository.findByYear 可以查某年，
    // 我们需要一个查"所有历史"的方法。或者直接在这里用 prisma 调用。
    // 为了架构解耦，建议给 DashboardRepository 加一个 findAllHistory 方法，或者复用 findByYear 循环。
    // 鉴于个人数据量不大，我们直接查全表。

    // 【临时直接调用 Prisma 以演示逻辑，实际建议放入 Repository】
    const { prisma } = require('@/utils/db');
    const allRecords = await prisma.salaryRecord.findMany();
    const latest = await DashboardRepository.findLatest();

    // 2. 动态计算累计余额 (Status Quo)
    // 逻辑：个人扣款 * 2 = 总额 (假设企业 1:1)
    let totalFund = 0;    // 公积金累计
    let totalAnnuity = 0; // 年金累计
    let totalPension = 0; // 养老累计
    let totalMedical = 0; // 医保累计

    // 失业保险累计月数
    let unemploymentMonths = 0;

    allRecords.forEach((r: any) => {
      totalFund += (r.housingFundPersonal || 0) * 2;
      totalAnnuity += (r.annuityPersonal || 0) * 2;
      totalPension += (r.pensionPersonal || 0) * 2;
      totalMedical += (r.medicalPersonal || 0) * 2;

      if ((r.unemploymentPersonal || 0) > 0) {
        unemploymentMonths += 1;
      }
    });

    // 3. 提取当前月度投入能力 (Flow)
    // 用于推演未来增长
    const monthlyFund = (latest?.housingFundPersonal || 0) * 2;
    const monthlyAnnuity = (latest?.annuityPersonal || 0) * 2;
    const monthlyPension = (latest?.pensionPersonal || 0) * 2;
    const monthlyMedical = (latest?.medicalPersonal || 0) * 2;

    // 4. 组装响应数据
    return {
      // 顶部卡片数据
      summary: {
        fundTotal: totalFund,
        monthlyPayment: monthlyFund + monthlyAnnuity + monthlyPension + monthlyMedical, // 广义福利投入
        // 退休年龄后端不存了，给一个默认值，前端可以自己存 LocalStorage
        defaultRetireAge: 60
      },

      // 模拟器基数 (前端拿到这个后，结合 Slider 的收益率自行计算复利)
      simulatorBase: {
        currentAge: 33, // 示例，实际可从 User 表或前端配置
        balances: {
          fund: totalFund,
          annuity: totalAnnuity,
          pension: totalPension
        },
        monthlyAdds: {
          fund: monthlyFund,
          annuity: monthlyAnnuity,
          pension: monthlyPension
        }
      },

      // 底部明细
      details: {
        medical: {
          status: (latest?.medicalPersonal || 0) > 0 ? '正常' : '断缴',
          personal: latest?.medicalPersonal || 0,
          company: latest?.medicalPersonal || 0 // 1:1
        },
        unemployment: {
          months: unemploymentMonths,
          coverage: 85 // 静态示例
        },
        injury: {
          status: '已激活',
          // 工伤完全由企业承担，个人无数据，给个估算值或 0
          amount: (latest?.baseSalary || 0) * 0.005
        }
      }
    };
  }
};