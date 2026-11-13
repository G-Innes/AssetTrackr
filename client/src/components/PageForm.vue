<script lang="ts" setup>
import Logo from '@/components/Logo.vue'

defineProps<{
  heading: string
  formLabel: string
}>()

defineEmits<{
  submit: []
}>()
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center px-4 py-10">
    <router-link to="/" class="mb-8"><Logo /></router-link>
    <div class="panel w-full max-w-sm p-6 sm:p-8">
      <h1 class="font-display mb-6 text-xl font-bold text-white">{{ heading }}</h1>
      <form class="space-y-4" :aria-label="formLabel" novalidate @submit.prevent="$emit('submit')">
        <slot />
      </form>
      <slot name="footer" />
    </div>
  </div>
</template>
