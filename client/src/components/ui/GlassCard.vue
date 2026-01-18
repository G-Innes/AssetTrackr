<script setup lang="ts">
interface Props {
  hover?: boolean
  glow?: 'primary' | 'secondary' | 'success' | 'danger' | 'white' | 'none'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  hover: true,
  glow: 'none',
  padding: 'md',
})

const glowClasses = {
  primary: 'shadow-glow-primary',
  secondary: 'shadow-glow-secondary',
  success: 'shadow-glow-success',
  danger: 'shadow-glow-danger',
  white: 'shadow-glow-white',
  none: '',
}

const paddingClasses = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-8',
}
</script>

<template>
  <div
    v-motion
    :initial="{ opacity: 0, y: 20 }"
    :enter="{ opacity: 1, y: 0, transition: { duration: 400, ease: 'easeOut' } }"
    :class="['glass-card', paddingClasses[padding], glowClasses[glow], hover && 'glass-card-hover']"
  >
    <slot />
  </div>
</template>

<style scoped>
.glass-card {
  @apply relative overflow-hidden rounded-2xl border border-white/10;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.glass-card-hover {
  @apply transition-all duration-300 ease-out;
}

.glass-card-hover:hover {
  @apply -translate-y-1 border-white/20;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.3),
    0 0 30px rgba(99, 102, 241, 0.1);
}
</style>
