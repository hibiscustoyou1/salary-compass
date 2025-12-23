<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="visible"
      class="fixed inset-0 z-[9999] flex justify-center items-center bg-white/50 backdrop-blur-[2px]"
    >
      <div class="animate-spin rounded-full h-10 w-10 border-[3px] border-gray-200 border-t-emerald-600"></div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
  defineProps<{
    visible: boolean;
  }>();
</script>
