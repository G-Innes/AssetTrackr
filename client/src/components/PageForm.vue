<script lang="ts" setup>
defineProps<{
  heading: string
  formLabel: string
}>()

defineEmits<{
  submit: []
}>()
</script>

<template>
  <div class="flex min-h-screen items-center justify-center">
    <div class="relative z-10 max-w-md p-6">
      <h2 class="mb-6 font-display text-3xl font-bold text-white">{{ heading }}</h2>

      <div class="glass-card shadow-glow-white rounded-xl border border-white/10 p-8">
        <form class="space-y-6" :aria-label="formLabel" @submit.prevent="$emit('submit')">
          <slot />
        </form>

        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.glass-card {
  background-color: rgba(255, 255, 255, 0.05) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
