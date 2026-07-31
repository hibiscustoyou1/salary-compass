<template>
  <transition name="modal-fade" @after-leave="destroy">
    <div v-show="visible" class="fixed inset-0 z-[9998] flex items-center justify-center">
      <div class="mask absolute inset-0 bg-black/40 backdrop-blur-sm" @click="handleCancel"></div>

      <div
        class="dialog-box relative w-[90%] max-w-[400px] bg-white dark:bg-card-dark rounded-xl shadow-2xl border border-border-light dark:border-border-dark overflow-hidden"
      >
        <div class="p-6">
          <div class="flex items-center gap-3 mb-3">
            <span
              class="material-symbols-outlined text-[28px]"
              :class="options.type === 'danger' ? 'text-red-500' : 'text-amber-500'"
            >
              {{ options.type === 'danger' ? 'warning' : 'help' }}
            </span>
            <h3 class="text-lg font-bold text-text-main-light dark:text-white">{{ options.title }}</h3>
          </div>
          <p class="text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed ml-10">
            {{ options.content }}
          </p>
        </div>

        <div class="bg-gray-50/50 dark:bg-black/20 px-6 py-4 flex justify-end gap-3 border-t border-border-light dark:border-border-dark">
          <button
            @click="handleCancel"
            class="px-4 py-2 text-sm font-medium rounded-lg text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {{ options.cancelText || '取消' }}
          </button>
          <button
            @click="handleConfirm"
            class="px-4 py-2 text-sm font-medium rounded-lg text-white shadow-soft transition-all"
            :class="options.type === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary-hover'"
          >
            {{ options.confirmText || '确定' }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';

  export interface ConfirmOptions {
    title: string;
    content: string;
    type?: 'warning' | 'danger';
    confirmText?: string;
    cancelText?: string;
  }

  const props = defineProps<{
    options: ConfirmOptions;
    onConfirm: () => void;
    onCancel: () => void;
    onDestroy: () => void;
  }>();

  const visible = ref(false);

  onMounted(() => {
    // 延迟渲染触发入场动画
    requestAnimationFrame(() => {
      visible.value = true;
    });
  });

  const handleConfirm = () => {
    visible.value = false;
    props.onConfirm();
  };

  const handleCancel = () => {
    visible.value = false;
    props.onCancel();
  };

  const destroy = () => {
    props.onDestroy();
  };
</script>

<style scoped>
/* 1. 外层包裹器：仅作为一个过渡钩子使用，不再做整体的 opacity 变化，规避渲染 Bug */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.35s ease; /* 确保时间比内部动画略长，维持 DOM 存在 */
}

/* 2. 遮罩层动画：独立控制背景色与模糊度的过渡 */
.modal-fade-enter-active .mask,
.modal-fade-leave-active .mask {
  transition: opacity 0.3s ease, backdrop-filter 0.3s ease;
}
.modal-fade-enter-from .mask,
.modal-fade-leave-to .mask {
  opacity: 0;
  backdrop-filter: blur(0px); /* 强制要求浏览器从 0 模糊度开始计算 */
}

/* 3. 弹窗主体动画：加入 0.05s 的延迟，让蒙层先出来变暗/变模糊，弹窗再优雅跃出 */
.modal-fade-enter-active .dialog-box {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s;
}
.modal-fade-leave-active .dialog-box {
  transition: all 0.25s ease;
}
.modal-fade-enter-from .dialog-box,
.modal-fade-leave-to .dialog-box {
  opacity: 0;
  transform: scale(0.92) translateY(10px);
}
</style>