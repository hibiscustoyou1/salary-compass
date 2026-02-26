import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useUIStore = defineStore('ui', () => {
  // === State (Init from localStorage) ===
  const isDarkMode = ref(localStorage.getItem('theme') === 'dark');
  const isPrivacyMode = ref(localStorage.getItem('privacyMode') === 'true');
  const isMobileMenuOpen = ref(false); // [移动端专用] 控制折叠菜单状态

  // === Actions ===
  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value;
  };

  const togglePrivacy = () => {
    isPrivacyMode.value = !isPrivacyMode.value;
  };

  const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value;
  };

  const closeMobileMenu = () => {
    isMobileMenuOpen.value = false;
  };

  // === Persistence & Side Effects ===

  // 1. 监听主题变化 -> 操作 DOM + 存 LocalStorage
  watch(isDarkMode, (val) => {
    const html = document.documentElement;
    if (val) {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, { immediate: true }); // immediate: true 确保初始化时立即执行

  // 2. 监听隐私模式 -> 存 LocalStorage
  watch(isPrivacyMode, (val) => {
    localStorage.setItem('privacyMode', String(val));
  });

  return {
    isDarkMode,
    isPrivacyMode,
    isMobileMenuOpen,
    toggleTheme,
    togglePrivacy,
    toggleMobileMenu,
    closeMobileMenu
  };
});