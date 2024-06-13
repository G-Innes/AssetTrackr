// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import { authenticate } from './guards';
import HomeLayout from '../layouts/HomeLayout.vue';
import DashboardLayout from '../layouts/DashboardLayout.vue';

const router = createRouter({
  history: createWebHistory(process.env.NODE_ENV === 'production' ? 'https://assettrackr.enrpm9tib5nri.eu-central-1.cs.amazonlightsail.com' : 'http://localhost:3000'),
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
