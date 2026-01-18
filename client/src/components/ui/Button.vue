<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  type: 'button',
  fullWidth: false,
})

const variantClasses = {
  primary: `
    bg-primary-600 text-white
    hover:bg-primary-500 hover:shadow-glow-primary hover:-translate-y-0.5
    active:translate-y-0 active:bg-primary-700
  `,
  secondary: `
    bg-secondary-600 text-white
    hover:bg-secondary-500 hover:shadow-glow-secondary hover:-translate-y-0.5
    active:translate-y-0 active:bg-secondary-700
  `,
  success: `
    bg-success-600 text-white
    hover:bg-success-500 hover:shadow-glow-success hover:-translate-y-0.5
    active:translate-y-0 active:bg-success-700
  `,
  danger: `
    bg-danger-600 text-white
    hover:bg-danger-500 hover:shadow-glow-danger hover:-translate-y-0.5
    active:translate-y-0 active:bg-danger-700
  `,
  ghost: `
    bg-transparent text-white/80
    hover:bg-white/10 hover:text-white
    active:bg-white/5
  `,
  outline: `
    bg-transparent text-white border border-white/20
    hover:bg-white/10 hover:border-white/40 hover:-translate-y-0.5
    active:translate-y-0 active:bg-white/5
  `,
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center rounded-xl font-medium',
      'transition-all duration-200 ease-out',
      'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 focus:ring-offset-dark-900',
      'disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none',
      variantClasses[variant],
      sizeClasses[size],
      fullWidth && 'w-full',
    ]"
  >
    <!-- Loading spinner -->
    <svg
      v-if="loading"
      class="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
    <slot />
  </button>
</template>
