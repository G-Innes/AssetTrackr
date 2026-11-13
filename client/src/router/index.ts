// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import SignupView from '../views/SignupView.vue'
import DashboardView from '../views/DashboardView.vue'
import TradeView from '../views/TradeView.vue'
import TransactionsView from '../views/TransactionsView.vue'
import { authenticate, redirectIfAuthenticated } from './guards'
import HomeLayout from '../layouts/HomeLayout.vue'
import DashboardLayout from '../layouts/DashboardLayout.vue'

const router = createRouter({
  history: createWebHistory('/'),
  routes: [
    {
      path: '/dashboard',
      component: DashboardLayout,
      beforeEnter: [authenticate],
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: DashboardView,
        },
        {
          path: 'asset-manage',
          name: 'AssetManage',
          component: TradeView,
        },
        {
          path: 'transactions',
          name: 'Transactions',
          component: TransactionsView,
        },
      ],
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginView,
      beforeEnter: [redirectIfAuthenticated],
    },
    {
      path: '/signup',
      name: 'Signup',
      component: SignupView,
      beforeEnter: [redirectIfAuthenticated],
    },
    {
      path: '/',
      component: HomeLayout,
      children: [
        {
          path: '',
          name: 'Home',
          component: HomeView,
        },
      ],
    },
    // Unknown URLs go home rather than rendering a blank page
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

export default router
