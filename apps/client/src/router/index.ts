import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/',
    component: () => import('@/components/layouts/MainLayout.vue'),
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue')
      },
      // 后续添加 salary, tax, benefits 等路由
      {
        path: 'salary',
        name: 'Salary',
        component: () => import('@/views/salary/SalaryView.vue') // 暂时占位
      },
      {
        path: 'tax',
        name: 'Tax',
        component: () => import('@/views/tax/TaxView.vue') // 暂时占位
      },
      {
        path: 'benefits',
        name: 'Benefits',
        component: () => import('@/views/dashboard/DashboardView.vue') // 暂时占位
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/components/hello-world.vue') // 暂时使用 hello-world 作为登录占位
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router