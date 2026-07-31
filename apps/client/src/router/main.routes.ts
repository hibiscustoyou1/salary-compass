// apps/client/src/router/main.routes.ts
// apps/client/src/router/main.routes.ts
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: {
      title: '系统接入',
      // 免登标识符
      public: true
    }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/dashboard/DashboardView.vue'),
    meta: {
      layout: 'MainLayout',
      title: '职业财富分析',
      subtitle: '2024财年绩效表现',
      icon: 'dashboard',
      menuOrder: 1
    }
  },
  {
    path: '/salary',
    name: 'salary',
    component: () => import('@/views/SalaryListView.vue'),
    meta: {
      layout: 'MainLayout',
      title: '薪资详情',
      subtitle: '电子工资单存档',
      icon: 'payments',
      menuOrder: 2
    }
  },
  {
    path: '/tax',
    name: 'tax',
    component: () => import('@/views/TaxAnalysisView.vue'),
    meta: {
      layout: 'MainLayout',
      title: '税务分析',
      subtitle: '2024财年税务效能分析',
      icon: 'account_balance',
      menuOrder: 3
    }
  },
  {
    path: '/benefits',
    name: 'benefits',
    component: () => import('@/views/BenefitsView.vue'),
    meta: {
      layout: 'MainLayout',
      title: '福利详情',
      subtitle: '长期福利与退休资产预测',
      icon: 'trending_up',
      menuOrder: 4
    }
  }
];

export default routes;