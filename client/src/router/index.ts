// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import { authenticate } from './guards';
import HomeLayout from '../layouts/HomeLayout.vue';
import DashboardLayout from '../layouts/DashboardLayout.vue';

const router = createRouter({
  history: createWebHistory(process.env.NODE_ENV === 'production' ? import.meta.env.PROD_BASE_URL : import.meta.env.DEV_BASE_URL),
  routes: [
    {
      path: '/dashboard',
      component: DashboardLayout,
      beforeEnter: [authenticate],
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: () => import('../views/DashboardView.vue'),
        },
        {
          path: 'asset-manage',
          name: 'AssetManage',
          component: () => import('../views/AssetView.vue'),
        },
        // {
        //   path: 'project/:id',
        //   name: 'Project',
        //   component: () => import('../views/ProjectView.vue'),
        // },
      ],
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/signup',
      name: 'Signup',
      component: () => import('../views/SignupView.vue'),
    },
    {
      path: '',
      component: HomeLayout,
      children: [
        {
          path: '',
          name: 'Home',
          component: HomeView,
          beforeEnter: authenticate,
        },
      ],
    },
  ],
});

export default router;
