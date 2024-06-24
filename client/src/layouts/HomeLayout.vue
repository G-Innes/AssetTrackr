<script setup lang="ts">
import StackedLayout from './StackedLayout.vue'

const links = [
  { label: 'Login', name: 'Login', to: '/login' },
  { label: 'Signup', name: 'Signup', to: '/signup' },
]
</script>

<template>
  <StackedLayout :links="links" />
</template>
