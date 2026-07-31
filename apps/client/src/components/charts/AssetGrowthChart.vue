<template>
  <div class="w-full h-[300px]">
    <BaseEChart :options="chartOptions" :theme="isDark ? 'dark' : undefined" />
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, onMounted, onUnmounted } from 'vue';
  import BaseEChart from '@/components/charts/BaseEChart.vue';
  import * as echarts from 'echarts';

  const props = defineProps<{
    rate: number;          // 年化收益率 (e.g. 4.5)
    retirementAge: number; // 退休年龄 (e.g. 65)
    privacyMode: boolean;
    // [新增] 接收真实资金数据
    initialProvidentFund: number; // 当前公积金余额
    initialAnnuity: number;       // 当前年金余额
    monthlyProvidentFund: number; // 月公积金(双边)
    monthlyAnnuity: number;       // 月年金(个人+企业)
    monthlyPension: number;       // 月养老金(个人)
  }>();

  const isDark = ref(document.documentElement.classList.contains('dark'));
  let observer: MutationObserver | null = null;

  onMounted(() => {
    observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.attributeName === 'class') {
          isDark.value = document.documentElement.classList.contains('dark');
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  });

  onUnmounted(() => observer?.disconnect());

  const chartOptions = computed(() => {
    if (props.privacyMode) {
      return {
        backgroundColor: 'transparent',
        graphic: {
          type: 'text', left: 'center', top: 'center',
          style: {
            text: '****\n数据已隐藏',
            font: 'bold 24px sans-serif',
            fill: isDark.value ? '#94a3b8' : '#cbd5e1',
            textAlign: 'center'
          }
        }
      };
    }

    const currentYear = new Date().getFullYear();
    const currentAge = 32;
    const yearsToRetire = Math.max(0, props.retirementAge - currentAge);
    const endYear = currentYear + yearsToRetire + 5;

    const years: number[] = [];
    for (let y = currentYear; y <= endYear; y += 2) {
      years.push(y);
    }

    const generateCurve = (baseAmount: number, monthlyAdd: number, rateMultiplier: number) => {
      return years.map(year => {
        const n = year - currentYear;
        if (n < 0) return baseAmount;
        // 复利公式：Future Value of a Series (简单按年复利估算)
        // 简化模型：当前本金复利 + 每年新增投入复利
        const yearsPassed = n;
        const compoundFactor = Math.pow(1 + (props.rate * rateMultiplier / 100), yearsPassed);

        // 1. 初始本金增值
        const initialGrown = baseAmount * compoundFactor;

        // 2. 持续定投增值 (年金终值近似公式: PMT * ((1+r)^n - 1)/r )
        // 将月投转化为年投
        const yearlyContribution = monthlyAdd * 12;
        const r = props.rate * rateMultiplier / 100;
        let contributionGrown: number;
        if (r > 0 && yearsPassed > 0) {
          contributionGrown = yearlyContribution * ((Math.pow(1 + r, yearsPassed) - 1) / r);
        } else {
          contributionGrown = yearlyContribution * yearsPassed;
        }

        return Math.floor(initialGrown + contributionGrown);
      });
    };

    // [修改] 使用 Props 传入的真实数据
    // 1. 公积金 (稳健，收益率=用户设定)
    const dataProvident = generateCurve(props.initialProvidentFund, props.monthlyProvidentFund, 1.0);
    // 2. 企业年金 (进取，收益率=用户设定 * 1.2)
    const dataAnnuity = generateCurve(props.initialAnnuity, props.monthlyAnnuity, 1.2);
    // 3. 基本养老 (保守，收益率=用户设定 * 0.6) - 假设养老金账户目前为 0 或估算值
    // 这里暂时假设养老金个人账户累计额约为公积金的 1/3 用于展示，或者传 0
    const estimatedPensionBalance = 100000;
    const dataPension = generateCurve(estimatedPensionBalance, props.monthlyPension, 0.6);

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: isDark.value ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        borderColor: isDark.value ? '#334155' : '#e2e8f0',
        textStyle: { color: isDark.value ? '#f8fafc' : '#0f172a' },
        formatter: (params: any) => {
          let html = `${params[0].name}年 预估资产<br/>`;
          let total = 0;
          params.forEach((item: any) => {
            total += item.value;
            html += `<div style="display:flex;justify-content:space-between;align-items:center;width:180px">
            <span style="color:${item.color}">● ${item.seriesName}</span>
            <span style="font-weight:bold">¥${(item.value / 10000).toFixed(1)}w</span>
          </div>`;
          });
          html += `<div style="border-top:1px solid #ccc;margin-top:4px;padding-top:4px;display:flex;justify-content:space-between;font-weight:bold">
            <span>总计</span>
            <span>¥${(total / 10000).toFixed(1)}w</span>
          </div>`
          return html;
        }
      },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: years,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: isDark.value ? '#94a3b8' : '#64748b' }
      },
      yAxis: {
        type: 'value',
        show: true,
        splitLine: { lineStyle: { type: 'dashed', color: isDark.value ? '#334155' : '#e2e8f0' } },
        axisLabel: {
          formatter: (v: number) => (v/10000).toFixed(0) + 'w',
          color: isDark.value ? '#94a3b8' : '#64748b'
        }
      },
      series: [
        {
          name: '公积金',
          type: 'line',
          smooth: true,
          showSymbol: false,
          stack: 'Total',
          lineStyle: { width: 0 },
          areaStyle: { opacity: 0.8, color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0, color: 'rgba(16, 185, 129, 0.8)'}, {offset: 1, color: 'rgba(16, 185, 129, 0.1)'}]) },
          itemStyle: { color: '#10b981' },
          data: dataProvident
        },
        {
          name: '企业年金',
          type: 'line',
          smooth: true,
          showSymbol: false,
          stack: 'Total',
          lineStyle: { width: 0 },
          areaStyle: { opacity: 0.8, color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0, color: 'rgba(96, 165, 250, 0.8)'}, {offset: 1, color: 'rgba(96, 165, 250, 0.1)'}]) },
          itemStyle: { color: '#60a5fa' },
          data: dataAnnuity
        },
        {
          name: '基本养老金',
          type: 'line',
          smooth: true,
          showSymbol: false,
          stack: 'Total',
          lineStyle: { width: 0 },
          areaStyle: { opacity: 0.8, color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0, color: 'rgba(18, 65, 161, 0.8)'}, {offset: 1, color: 'rgba(18, 65, 161, 0.1)'}]) },
          itemStyle: { color: '#1241a1' },
          data: dataPension
        }
      ]
    };
  });
</script>