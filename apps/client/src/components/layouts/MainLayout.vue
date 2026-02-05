<template>
  <div
    class="flex min-h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark font-display text-text-main-light dark:text-text-main-dark">
    <SideBar/>

    <main class="flex-1 flex flex-col h-screen overflow-y-auto scroll-smooth">
      <TopHeader/>

      <div class="p-6 max-w-[1400px] w-full mx-auto flex flex-col gap-6">
        <router-view/>
      </div>

      <footer
        class="p-6 mt-auto border-t border-border-light dark:border-border-dark text-center text-xs text-text-secondary-light dark:text-text-secondary-dark">
        © 2024 WealthTrack Analytics. Confidential & Proprietary.
      </footer>
    </main>
  </div>
</template>

<script setup lang="ts">
  import SideBar from '@/components/layouts/SideBar.vue';
  import TopHeader from '@/components/layouts/TopHeader.vue';
</script>