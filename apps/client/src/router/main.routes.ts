// apps/client/src/router/main.routes.ts
// apps/client/src/router/main.routes.ts
import type {RouteRecordRaw} from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layout/MainLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/DashboardView.vue'),
        meta: {
          title: '职业财富分析',
          subtitle: '2024财年绩效表现'
        }
      },
      {
        path: 'salary',
        name: 'salary',
        component: () => import('@/views/SalaryListView.vue'),
        meta: {
          title: '薪资详情',
          subtitle: '电子工资单存档'
        }
      },
      {
        path: 'tax',
        name: 'tax',
        component: () => import('@/views/TaxAnalysisView.vue'),
        meta: {
          title: '税务分析',
          subtitle: '2024财年税务效能分析'
        }
      },
      {
        path: 'benefits',
        name: 'benefits',
        component: () => import('@/views/BenefitsView.vue'),
        meta: {
          title: '福利详情',
          subtitle: '长期福利与退休资产预测'
        }
      }
    ]
  }
];

export default routes;