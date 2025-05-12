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

      <div class="glass-card rounded-xl border border-white/10 p-8 shadow-glow-white">
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

/* Force all inputs within this component to have transparent backgrounds and white text */
:deep(input),
:deep(select),
:deep(textarea) {
  background-color: transparent !important;
  background: transparent !important;
  color: white !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}

:deep(input:focus),
:deep(select:focus),
:deep(textarea:focus) {
  --tw-ring-color: rgb(15, 23, 42) !important;
  --tw-ring-offset-color: rgb(15, 23, 42) !important;
  border-color: rgb(15, 23, 42) !important;
  box-shadow: 0 0 0 2px rgba(15, 23, 42, 0.6) !important;
}
</style>
