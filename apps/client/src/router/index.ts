import { createRouter, createWebHistory } from 'vue-router'

const routes = []

const modules = import.meta.glob('./*.routes.ts', { eager: true })

for (const path in modules) {
  const mod = modules[path] as any
  const route = mod.default
  if (Array.isArray(route)) {
    routes.push(...route)
  } else {
    routes.push(route)
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// === 添加全局路由守卫 ===
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token');

  // 如果前往的不是公开页面且没有 token，强制重定向到登录
  if (!to.meta.public && !token) {
    next({ name: 'login' });
  } else if (to.name === 'login' && token) {
    // 如果已经有 token 试图进入登录页，则重定向到 dashboard
    next({ name: 'dashboard' });
  } else {
    // 正常放行
    next();
  }
});

export default router
