<script setup lang="ts">
import { FwbNavbarLink } from 'flowbite-vue'
import StackedLayout from './StackedLayout.vue'
import { logout } from '../services/apiService'
import { useRouter } from 'vue-router'

const router = useRouter()

const links = [
{ label: 'Dashboard', name: 'Dashboard', to: '/dashboard' },
  { label: 'Buy or Sell', name: 'AssetManage', to: '/dashboard/asset-manage' },
  { label: 'My Transactions', name: 'Transactions', to: '/dashboard/transactions' }
]

function logoutUser() {
  console.log('log out clicked')
  logout()
  console.log('logged out navigate to login')
  router.push({ name: 'Login' })
  location.reload();
}
</script>

<template>
  <StackedLayout :links="links">
    <template #menu>
      <FwbNavbarLink @click.prevent="logoutUser" link="#">Logout</FwbNavbarLink>
      
    </template>
  </StackedLayout>
</template>
