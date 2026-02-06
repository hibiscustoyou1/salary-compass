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
    rate: number;         // 年化收益率 (e.g. 4.5)
    retirementAge: number;// 退休年龄 (e.g. 65)
    privacyMode: boolean;
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
    const currentAge = 32; // 假设当前年龄
    const yearsToRetire = Math.max(0, props.retirementAge - currentAge);
    const endYear = currentYear + yearsToRetire + 5; // 多展示5年

    // 生成 X 轴年份
    const years = [];
    for (let y = currentYear; y <= endYear; y += 2) {
      years.push(y);
    }

    // 模拟生成三条曲线数据
    // 公式：Base * (1 + rate)^n
    const generateCurve = (baseAmount: number, monthlyAdd: number, rateMultiplier: number) => {
      return years.map(year => {
        const n = year - currentYear;
        if (n < 0) return baseAmount;
        // 简单复利模拟：本金 + (月存*12*年数) * 复利因子
        const totalInvested = baseAmount + (monthlyAdd * 12 * n);
        const compoundFactor = Math.pow(1 + (props.rate * rateMultiplier / 100), n);
        return Math.floor(totalInvested * compoundFactor);
      });
    };

    // 1. 公积金 (稳健，收益率=用户设定)
    const dataProvident = generateCurve(500000, 4000, 1.0);
    // 2. 企业年金 (进取，收益率=用户设定 * 1.2)
    const dataAnnuity = generateCurve(200000, 1200, 1.2);
    // 3. 基本养老 (保守，收益率=用户设定 * 0.6)
    const dataPension = generateCurve(100000, 800, 0.6);

    const createGradient = (color: string) => {
      return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: color },
        { offset: 1, color: color.replace('0.8', '0').replace('1)', '0)') } // 简单hack，实际应传rgba
      ]);
    };

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: isDark.value ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        borderColor: isDark.value ? '#334155' : '#e2e8f0',
        textStyle: { color: isDark.value ? '#f8fafc' : '#0f172a' },
        formatter: (params: any) => {
          let html = `${params[0].name}年 预估资产<br/>`;
          params.forEach((item: any) => {
            html += `<div style="display:flex;justify-content:space-between;align-items:center;width:160px">
            <span style="color:${item.color}">● ${item.seriesName}</span>
            <span style="font-weight:bold">¥${(item.value / 10000).toFixed(1)}w</span>
          </div>`;
          });
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
          stack: 'Total', // 堆叠显示
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