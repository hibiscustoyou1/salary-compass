<template>
  <div class="bg-white dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-sm flex flex-col h-[400px]">
    <h3 class="text-lg font-bold text-text-main-light dark:text-white mb-1">收入结构健康度</h3>
    <p class="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-6">年度薪酬构成比例</p>

    <div class="flex-1 flex flex-col justify-center gap-8">
      <div class="space-y-2">
        <div class="flex justify-between text-sm">
          <span class="font-medium text-text-main-light dark:text-white">固定薪资</span>
          <span class="font-bold text-primary">¥180,000</span>
        </div>
        <div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div class="bg-primary h-3 rounded-full transition-all duration-1000" style="width: 65%"></div>
        </div>
      </div>

      <div class="space-y-2">
        <div class="flex justify-between text-sm">
          <span class="font-medium text-text-main-light dark:text-white">绩效奖金</span>
          <span class="font-bold text-blue-400">¥65,000</span>
        </div>
        <div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div class="bg-blue-400 h-3 rounded-full transition-all duration-1000 delay-200" style="width: 25%"></div>
        </div>
      </div>

      <div class="space-y-2">
        <div class="flex justify-between text-sm">
          <span class="font-medium text-text-main-light dark:text-white">专项激励 (RSU)</span>
          <span class="font-bold text-emerald">¥35,000</span>
        </div>
        <div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div class="bg-emerald h-3 rounded-full transition-all duration-1000 delay-400" style="width: 10%"></div>
        </div>
      </div>
    </div>

    <div class="mt-6 pt-4 border-t border-border-light dark:border-border-dark">
      <div class="flex justify-between items-center">
        <span class="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">年度总薪酬</span>
        <span class="text-xl font-black text-text-main-light dark:text-white">¥280,000</span>
      </div>
    </div>
  </div>
</template>