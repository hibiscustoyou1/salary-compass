<template>
  <div class="bg-white dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-sm">
    <div class="flex justify-between items-start mb-6">
      <div>
        <h3 class="text-lg font-bold text-text-main-light dark:text-white">月度现金流拆解</h3>
        <p class="text-sm text-text-secondary-light dark:text-text-secondary-dark">月度毛收入去向分析</p>
      </div>
      <div class="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
        月均数据
      </div>
    </div>

    <div class="grid grid-cols-5 gap-2 h-[220px] items-end pb-6 border-b border-border-light dark:border-border-dark relative">
      <div class="flex flex-col items-center w-full h-full justify-end group relative">
        <span class="text-xs font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity text-primary">¥2.33万</span>
        <div class="w-full bg-primary/20 rounded-t-sm border-t-2 border-primary h-full relative" style="height: 100%;"></div>
        <p class="absolute -bottom-8 text-xs font-medium text-text-secondary-light text-center">毛薪</p>
      </div>

      <div class="flex flex-col items-center w-full h-full justify-end group relative">
        <span class="text-xs font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity text-muted-red">-¥0.51万</span>
        <div class="w-full bg-transparent h-full relative">
          <div class="absolute top-0 w-full bg-muted-red/20 border-t-2 border-muted-red rounded-t-sm" style="height: 22%;"></div>
        </div>
        <p class="absolute -bottom-8 text-xs font-medium text-text-secondary-light text-center">个税</p>
      </div>

      <div class="flex flex-col items-center w-full h-full justify-end group relative">
        <span class="text-xs font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity text-muted-red">-¥0.18万</span>
        <div class="w-full bg-transparent h-full relative">
          <div class="absolute top-[22%] w-full bg-muted-red/20 border-t-2 border-muted-red rounded-t-sm" style="height: 8%;"></div>
        </div>
        <p class="absolute -bottom-8 text-xs font-medium text-text-secondary-light text-center">社保</p>
      </div>

      <div class="flex flex-col items-center w-full h-full justify-end group relative">
        <span class="text-xs font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity text-emerald">-¥0.19万</span>
        <div class="w-full bg-transparent h-full relative">
          <div class="absolute top-[30%] w-full bg-emerald/20 border-t-2 border-emerald rounded-t-sm" style="height: 8%;"></div>
        </div>
        <p class="absolute -bottom-8 text-xs font-medium text-text-secondary-light text-center">公积金</p>
      </div>

      <div class="flex flex-col items-center w-full h-full justify-end group relative">
        <span class="text-xs font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity text-emerald">¥1.45万</span>
        <div class="w-full bg-emerald rounded-t-sm h-full relative" style="height: 62%;"></div>
        <p class="absolute -bottom-8 text-xs font-medium text-text-secondary-light text-center">净薪</p>
      </div>
    </div>
  </div>
</template>