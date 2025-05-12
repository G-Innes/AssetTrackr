<script setup lang="ts">
import { RouterView } from 'vue-router'

const links = [
  { label: 'Dashboard', name: 'Dashboard', to: '/dashboard' },
  { label: 'Buy or Sell', name: 'AssetManage', to: '/dashboard/asset-manage' },
  { label: 'My Transactions', name: 'Transactions', to: '/dashboard/transactions' },
  { label: 'Login', name: 'Login', to: '/login' },
  { label: 'Signup', name: 'Signup', to: '/signup' },
]
</script>

<template>
  <!-- Header is now rendered in the HomeView component -->
  <RouterView />
</template>
