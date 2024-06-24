<script setup lang="ts">
import StackedLayout from './StackedLayout.vue'

const links = [
{ label: 'Dashboard', name: 'Dashboard', to: '/dashboard' },
  { label: 'Buy or Sell', name: 'AssetManage', to: '/dashboard/asset-manage' },
  { label: 'My Transactions', name: 'Transactions', to: '/dashboard/transactions' }
]

</script>

<template>
  <StackedLayout :links="links">
  </StackedLayout>
</template>
