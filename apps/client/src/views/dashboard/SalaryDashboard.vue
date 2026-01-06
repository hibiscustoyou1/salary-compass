<template>
  <div class="bg-gray-50 dark:bg-gray-900 min-h-screen font-sans flex flex-col md:flex-row h-screen overflow-hidden transition-colors duration-300">

    <AppSidebar
      :model-value="currentViewId"
      @update:model-value="handleViewChange"
      :menu-items="menuConfig"
      :is-open="isMobileMenuOpen"
      @close="isMobileMenuOpen = false"
    />

    <main class="flex-1 flex flex-col h-full relative w-full">

      <AppHeader
        :title="currentMenu?.label"
        :selected-year="selectedYear"
        :available-years="availableYears"
        :is-privacy-mode="isPrivacyMode"
        @update:selected-year="handleYearChange"
        @toggle-privacy="isPrivacyMode = !isPrivacyMode"
        @toggle-menu="isMobileMenuOpen = !isMobileMenuOpen"
      />

      <div class="flex-1 overflow-y-auto p-4 md:p-6 relative">

        <LoadingOverlay :visible="loading" />

        <div
          :class="{ 'opacity-20 blur-[2px] pointer-events-none': loading }"
          class="transition-all duration-300 max-w-7xl mx-auto pb-10"
        >

          <Transition name="fade" mode="out-in">
            <component
              :is="currentMenu?.component"
              :key="currentViewId"
              :filtered-data="filteredList"
              :full-data="fullWageList"
              :selected-year="selectedYear"
              :is-privacy-mode="isPrivacyMode"
            />
          </Transition>

        </div>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, nextTick } from 'vue';
  import { useSalaryData } from './composables/useSalaryData';

  // --- 引入子组件 ---
  import AppSidebar from './components/AppSidebar.vue';
  import AppHeader from './components/AppHeader.vue';
  import LoadingOverlay from './components/LoadingOverlay.vue';

  // --- 引入业务视图 ---
  import ViewOverview from './views/ViewOverview.vue';
  import ViewIncome from './views/ViewIncome.vue';
  import ViewExpenses from './views/ViewExpenses.vue';

  // --- 图标定义 (使用 currentColor 以自动适配暗黑模式) ---
  const IconDashboard = { template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>` };
  const IconIncome = { template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>` };
  const IconExpenses = { template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>` };

  // --- 1. 菜单配置 ---
  const menuConfig = [
    { id: 'dashboard', label: '总览', icon: IconDashboard, component: ViewOverview },
    { id: 'income', label: '收入分析', icon: IconIncome, component: ViewIncome },
    { id: 'expenses', label: '效能与支出', icon: IconExpenses, component: ViewExpenses },
  ];

  // --- 2. 状态管理 ---
  const currentViewId = ref('dashboard');
  const isMobileMenuOpen = ref(false); // 移动端侧边栏状态
  const isPrivacyMode = ref(true);     // 隐私模式默认开启
  const selectedYear = ref(0);         // 0 代表全部年份

  // 使用 Composable 获取数据逻辑
  const { loading, fullWageList, availableYears, initData } = useSalaryData();

  // --- 计算属性 ---
  const currentMenu = computed(() => menuConfig.find(item => item.id === currentViewId.value));

  // 根据年份筛选数据
  const filteredList = computed(() => {
    if (selectedYear.value === 0) return fullWageList.value;
    return fullWageList.value.filter(item => item.year === selectedYear.value);
  });

  // --- 3. 核心交互逻辑 (防闪烁优化) ---

  /**
   * 切换视图处理
   * 逻辑：开启Loading -> 等待300ms(UX) -> 切换视图ID -> 等待DOM更新 -> 关闭Loading
   */
  const handleViewChange = (viewId: string) => {
    if (viewId === currentViewId.value) return;

    // 1. 立即显示遮罩
    loading.value = true;

    // 2. 延迟执行，确保遮罩层动画完成，且给用户感知的加载反馈
    setTimeout(async () => {
      // 3. 切换组件状态
      currentViewId.value = viewId;

      // 4. 等待 Vue 完成 DOM 销毁和挂载
      await nextTick();

      // 5. 等待浏览器完成下一帧绘制 (确保图表已渲染上屏)
      requestAnimationFrame(() => {
        loading.value = false;
      });
    }, 300);
  };

  /**
   * 切换年份处理
   * 逻辑同上，确保图表重绘期间遮罩不消失
   */
  const handleYearChange = (year: number) => {
    if (year === selectedYear.value) return;

    loading.value = true;

    setTimeout(async () => {
      selectedYear.value = year; // 数据变化触发所有图表更新

      await nextTick();

      requestAnimationFrame(() => {
        loading.value = false;
      });
    }, 300);
  };

  // --- 生命周期 ---
  onMounted(() => {
    initData();
  });
</script>

<style scoped>
  /* 页面切换的淡入淡出动画 */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
