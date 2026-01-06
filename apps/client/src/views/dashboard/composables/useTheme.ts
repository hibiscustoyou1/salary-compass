import { ref, onMounted } from 'vue';

const isDark = ref(false);

export function useTheme() {
  
  // 初始化主题
  const initTheme = () => {
    // 1. 优先读取本地存储
    const cachedTheme = localStorage.getItem('theme');
    
    if (cachedTheme) {
      isDark.value = cachedTheme === 'dark';
    } else {
      // 2. 否则跟随系统偏好
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    applyTheme();
  };
  
  // 应用主题到 DOM
  const applyTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };
  
  // 切换主题
  const toggleTheme = () => {
    isDark.value = !isDark.value;
    applyTheme();
  };
  
  onMounted(() => {
    initTheme();
  });
  
  return {
    isDark,
    toggleTheme
  };
}
