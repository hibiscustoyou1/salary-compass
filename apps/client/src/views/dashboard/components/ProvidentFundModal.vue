<template>
  <div v-if="isVisible" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" @click="close"></div>

    <div class="relative w-full max-w-lg bg-white dark:bg-card-dark rounded-2xl shadow-2xl overflow-hidden transform transition-all border border-border-light dark:border-border-dark flex flex-col h-[600px] max-h-[90vh]">

      <div class="px-6 py-4 border-b border-border-light dark:border-border-dark flex justify-between items-center shrink-0 bg-slate-50/50 dark:bg-slate-800/50 z-10">
        <div class="flex items-center gap-2">
          <button v-if="viewState !== 'MAIN'" @click="viewState = 'MAIN'" class="mr-1 -ml-2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-text-secondary-light transition-colors">
            <span class="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <h3 class="text-lg font-bold text-text-main-light dark:text-white">
            {{ viewTitles[viewState] }}
          </h3>
        </div>
        <button @click="close" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-text-secondary-light">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div v-if="viewState === 'MAIN'" class="flex-1 overflow-y-auto custom-scrollbar p-6">

        <div class="bg-gradient-to-br from-primary to-blue-600 rounded-2xl p-6 text-white shadow-lg mb-8 relative overflow-hidden group">
          <div class="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform">
            <span class="material-symbols-outlined text-9xl">account_balance</span>
          </div>
          <p class="text-blue-100 text-sm font-medium mb-1">当前公积金余额</p>
          <h2 class="text-4xl font-bold tracking-tight mb-4">{{ store.providentFundBalance }}</h2>
          <div class="flex gap-4 text-xs font-medium text-blue-100/80">
            <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">trending_up</span> 稳健增长中</span>
            <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">update</span> {{ store.providentHistory[0]?.date || '无记录' }} 更新</span>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4 mb-8">
          <button @click="viewState = 'WITHDRAW'" class="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all group">
            <span class="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span class="material-symbols-outlined">output</span>
            </span>
            <span class="text-xs font-bold text-text-secondary-light dark:text-text-secondary-dark group-hover:text-amber-600 dark:group-hover:text-amber-400">提取/还贷</span>
          </button>

          <button @click="viewState = 'INTEREST'" class="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-emerald-custom hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all group">
            <span class="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span class="material-symbols-outlined">savings</span>
            </span>
            <span class="text-xs font-bold text-text-secondary-light dark:text-text-secondary-dark group-hover:text-emerald-custom dark:group-hover:text-emerald-400">年度结息</span>
          </button>

          <button @click="viewState = 'CALIBRATE'" class="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group">
            <span class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span class="material-symbols-outlined">tune</span>
            </span>
            <span class="text-xs font-bold text-text-secondary-light dark:text-text-secondary-dark group-hover:text-blue-500 dark:group-hover:text-blue-400">余额校准</span>
          </button>
        </div>

        <div>
          <div class="flex justify-between items-center mb-3">
            <h4 class="text-xs font-bold text-text-secondary-light uppercase tracking-wider">近期变动</h4>
            <button @click="openHistory" class="text-xs text-primary font-bold hover:underline flex items-center gap-0.5">
              查看全部 <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
          <div class="space-y-3">
            <div v-for="item in store.providentHistory" :key="item.id" class="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-colors">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                     :class="{
                    'bg-emerald-100/50 text-emerald-600': item.type === 'DEPOSIT' || item.type === 'INTEREST',
                    'bg-amber-100/50 text-amber-600': item.type === 'WITHDRAWAL',
                    'bg-blue-100/50 text-blue-600': item.type === 'CALIBRATION'
                  }">
                  <span class="material-symbols-outlined text-sm">
                    {{ item.type === 'WITHDRAWAL' ? 'output' : (item.type === 'CALIBRATION' ? 'tune' : 'input') }}
                  </span>
                </div>
                <div class="overflow-hidden">
                  <p class="text-sm font-bold text-text-main-light dark:text-white truncate">{{ item.note || item.category }}</p>
                  <p class="text-xs text-text-secondary-light truncate">{{ item.date }} · {{ item.category }}</p>
                </div>
              </div>
              <span class="font-mono font-bold text-sm shrink-0"
                    :class="item.type === 'WITHDRAWAL' ? 'text-text-main-light dark:text-white' : 'text-emerald-custom'">
                {{ item.amount > 0 && item.type !== 'CALIBRATION' ? '+' : '' }}{{ item.amount.toLocaleString() }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="viewState === 'HISTORY'" class="flex-1 overflow-y-auto custom-scrollbar p-0">
        <div v-if="loadingHistory" class="flex justify-center py-10">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <div v-else class="divide-y divide-border-light dark:divide-border-dark">
          <div v-for="item in store.fullProvidentHistory" :key="item.id" class="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex justify-between items-center group relative">

            <div class="flex gap-4">
              <div class="flex flex-col items-center min-w-[36px]">
                <span class="text-xs font-bold text-text-secondary-light">{{ item.date?.split('-')[1] }}/{{ item.date?.split('-')[2] }}</span>
                <span class="text-[10px] text-text-secondary-light/60">{{ item.date?.split('-')[0] }}</span>
              </div>

              <div>
                <p class="text-sm font-bold text-text-main-light dark:text-white">{{ item.category }}</p>
                <p class="text-xs text-text-secondary-light">{{ item.note || typeMap[item.type] }}</p>
              </div>
            </div>

            <div class="text-right group-hover:opacity-0 transition-opacity duration-200">
              <p class="font-mono font-bold text-sm"
                 :class="item.type === 'WITHDRAWAL' ? 'text-text-main-light dark:text-white' : 'text-emerald-custom'">
                {{ item.amount > 0 && item.type !== 'CALIBRATION' ? '+' : '' }}{{ item.amount.toLocaleString() }}
              </p>
              <span class="text-[10px] px-1.5 py-0.5 rounded font-bold mt-1 inline-block"
                    :class="typeColorMap[item.type] || 'bg-slate-100 text-slate-500'">
                   {{ typeMap[item.type] || item.type }}
                 </span>
            </div>

            <div class="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
              <button
                @click.stop="handleDelete(item.id)"
                class="w-9 h-9 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors"
                title="删除此记录"
              >
                <span class="material-symbols-outlined text-xl">delete</span>
              </button>
            </div>

          </div>

          <div v-if="store.fullProvidentHistory.length === 0" class="py-10 text-center text-text-secondary-light text-sm">
            暂无历史记录
          </div>
        </div>
      </div>

      <div v-else class="flex flex-col h-full overflow-hidden bg-white dark:bg-card-dark">
        <div class="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">

          <div class="p-4 rounded-xl flex gap-3 text-sm shrink-0"
               :class="{
                 'bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-100': viewState === 'WITHDRAW',
                 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-100': viewState === 'INTEREST',
                 'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-100': viewState === 'CALIBRATE'
               }">
            <span class="material-symbols-outlined text-lg shrink-0">info</span>
            <p class="leading-relaxed">{{ formHints[viewState] }}</p>
          </div>

          <div v-if="viewState === 'WITHDRAW'" class="space-y-1">
            <label class="text-sm font-medium text-text-main-light dark:text-white">提取类型</label>
            <div class="grid grid-cols-2 gap-2">
              <button v-for="type in withdrawTypes" :key="type"
                      @click="formData.category = type"
                      class="px-3 py-2 text-sm rounded-lg border transition-colors text-center"
                      :class="formData.category === type ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-slate-800 border-border-light dark:border-border-dark hover:border-primary/50 text-text-secondary-light'">
                {{ type }}
              </button>
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-sm font-medium text-text-main-light dark:text-white">
              {{ viewState === 'CALIBRATE' ? '校准后余额' : (viewState === 'WITHDRAW' ? '提取金额' : '入账金额') }}
            </label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary-light font-bold">¥</span>
              <input type="number" v-model.number="formData.amount"
                     class="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-border-light dark:border-border-dark rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono text-lg font-bold text-text-main-light dark:text-white"
                     placeholder="0.00">
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-sm font-medium text-text-main-light dark:text-white">发生日期</label>

            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <span class="material-symbols-outlined text-text-secondary-light">event</span>
              </div>
              <input
                type="date"
                v-model="formData.date"
                class="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-border-light dark:border-border-dark rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-text-main-light dark:text-white cursor-pointer custom-date-input"
              >
            </div>

            <div v-if="viewState === 'INTEREST'" class="flex gap-2 mt-2 flex-wrap">
              <button
                v-for="year in quickYears" :key="year"
                @click="setQuickDate(year)"
                class="px-3 py-1 text-xs font-bold rounded-lg border border-border-light dark:border-border-dark hover:border-emerald-custom hover:text-emerald-custom hover:bg-emerald-50 dark:hover:bg-emerald-900/10 text-text-secondary-light transition-all"
              >
                {{ year }}年
              </button>
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-sm font-medium text-text-main-light dark:text-white">备注说明</label>
            <input type="text" v-model="formData.note"
                   class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-border-light dark:border-border-dark rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-text-main-light dark:text-white"
                   :placeholder="viewState === 'CALIBRATE' ? '例如：APP数据同步' : '可选填...'">
          </div>

          <div class="h-4"></div>
        </div>

        <div class="p-6 pt-4 border-t border-border-light dark:border-border-dark bg-white dark:bg-card-dark shrink-0 z-10">
          <button @click="handleSubmit"
                  class="w-full py-3.5 rounded-xl font-bold shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-white"
                  :class="{
               'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20': viewState === 'WITHDRAW',
               'bg-emerald-custom hover:bg-emerald-600 shadow-emerald-500/20': viewState === 'INTEREST',
               'bg-primary hover:bg-primary-hover shadow-blue-500/20': viewState === 'CALIBRATE'
            }">
            <span class="material-symbols-outlined text-lg">check_circle</span>
            确认提交
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
  import {computed, reactive, ref, watch} from 'vue';
  import {useDashboardStore} from '@/stores/dashboard.store';

  type ViewState = 'MAIN' | 'WITHDRAW' | 'INTEREST' | 'CALIBRATE' | 'HISTORY';

  const store = useDashboardStore();
  const isVisible = computed(() => store.isProvidentModalOpen);
  const viewState = ref<ViewState>('MAIN');
  const loadingHistory = ref(false);

  // 动态计算快捷年份（近5年）
  const currentYear = new Date().getFullYear();
  const quickYears = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i);

  const typeMap: Record<string, string> = {
    WITHDRAWAL: '提取',
    INTEREST: '结息',
    CALIBRATION: '校准',
    DEPOSIT: '缴存'
  };

  const typeColorMap: Record<string, string> = {
    WITHDRAWAL: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    INTEREST: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    CALIBRATION: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    DEPOSIT: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
  };

  const viewTitles: Record<ViewState, string> = {
    MAIN: '公积金资产管理',
    WITHDRAW: '记录提取/还贷',
    INTEREST: '记录年度结息',
    CALIBRATE: '基准余额校准',
    HISTORY: '完整资金流水'
  };

  const formHints: Record<string, string> = {
    WITHDRAW: '记录因租房、购房或偿还贷款而提取的公积金。金额将从余额中扣除。',
    INTEREST: '通常在每年 6 月 30 日结息。记录后金额将计入余额。',
    CALIBRATE: '当系统计算值与实际公积金账户余额不符时使用。系统将以此金额为新基准。'
  };

  const withdrawTypes = ['租房提取', '自动冲还贷', '购房提取', '离职销户'];

  const formData = reactive({
    amount: '' as number | '',
    date: new Date().toISOString().split('T')[0],
    category: '租房提取',
    note: ''
  });

  // 打开历史并拉取全量数据
  const openHistory = async () => {
    viewState.value = 'HISTORY';
    loadingHistory.value = true;
    await store.fetchHistory('all');
    loadingHistory.value = false;
  };

  // 快捷设置日期 (例如点击 2024年 -> 2024-06-30)
  const setQuickDate = (year: number) => {
    formData.date = `${year}-06-30`;
  };

  // 监听日期变化，自动填充备注
  watch(() => formData.date, (newDate) => {
    if (viewState.value === 'INTEREST' && newDate) {
      const year = newDate.split('-')[0];
      const autoNote = `${year}年度公积金结息`;

      const isAutoFormat = /^\d{4}年度公积金结息$/.test(formData.note);
      if (!formData.note || isAutoFormat) {
        formData.note = autoNote;
      }
    }
  });

  // 视图切换时重置表单
  watch(viewState, (newVal) => {
    if (newVal === 'MAIN' || newVal === 'HISTORY') return;
    formData.amount = '';
    formData.date = new Date().toISOString().split('T')[0];
    formData.note = '';

    if (newVal === 'INTEREST') {
      formData.category = '年度结息';
      formData.date = `${new Date().getFullYear()}-06-30`;
      formData.note = `${new Date().getFullYear()}年度公积金结息`;
    } else if (newVal === 'CALIBRATE') {
      formData.category = '基准校准';
    } else {
      formData.category = '租房提取';
    }
  });

  const close = () => {
    store.toggleProvidentModal(false);
    setTimeout(() => viewState.value = 'MAIN', 300);
  };

  // 提交逻辑
  const handleSubmit = async () => {
    if (!formData.amount) return;
    let type = 'DEPOSIT';
    let finalAmount = Number(formData.amount);

    if (viewState.value === 'CALIBRATE') {
      type = 'CALIBRATION';
    } else if (viewState.value === 'WITHDRAW') {
      type = 'WITHDRAWAL';
      finalAmount = -Math.abs(finalAmount);
    } else if (viewState.value === 'INTEREST') {
      type = 'INTEREST';
      finalAmount = Math.abs(finalAmount);
    }

    await store.submitProvidentRecord({
      type,
      category: formData.category,
      amount: finalAmount,
      date: formData.date ?? '',
      note: formData.note
    });
    viewState.value = 'MAIN';
  };

  // 删除逻辑
  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要删除这条记录吗？删除后公积金余额将重新计算。')) {
      return;
    }
    loadingHistory.value = true;
    await store.removeProvidentRecord(id);
    loadingHistory.value = false;
  };
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 2px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #475569;
}

/* 原生日期选择器美化 */
.custom-date-input {
  color-scheme: light dark;
}
.custom-date-input::-webkit-calendar-picker-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: auto;
  height: auto;
  color: transparent;
  background: transparent;
  cursor: pointer;
}
</style>