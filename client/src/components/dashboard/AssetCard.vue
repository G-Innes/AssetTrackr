<script setup lang="ts">
import { computed } from 'vue'
import type { Asset } from '@/stores/dashboard'

const props = defineProps<{
  asset: Asset
  index?: number
}>()

// Computed property to determine if the price change is positive or negative
const priceChangeClass = computed(() => {
  if (!props.asset.price_change_percentage_24h) return 'text-dark-300'
  return props.asset.price_change_percentage_24h >= 0 ? 'text-success-400' : 'text-danger-400'
})

// Format currency
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

// Format percentage
const formatPercentage = (value: number | undefined): string => {
  if (!value) return '0.00%'
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

// Color mappings for dynamic classes (Tailwind safe)
const colorMappings = {
  icon: {
    primary: 'bg-primary-500/20 text-primary-400 ring-primary-500/30',
    secondary: 'bg-secondary-500/20 text-secondary-400 ring-secondary-500/30',
    success: 'bg-success-500/20 text-success-400 ring-success-500/30',
    danger: 'bg-danger-500/20 text-danger-400 ring-danger-500/30',
  },
  glow: {
    primary: 'hover:shadow-glow-primary',
    secondary: 'hover:shadow-glow-secondary',
    purple: 'hover:shadow-glow-purple',
    blue: 'hover:shadow-glow-blue',
  },
}

// Generate a background color based on asset name for the icon
const iconBackground = computed(() => {
  const colors = ['primary', 'secondary', 'success', 'danger'] as const
  const hash = props.asset.name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0)
  const colorIndex = hash % colors.length
  return colorMappings.icon[colors[colorIndex]]
})

// Generate a glow effect based on asset name
const cardGlow = computed(() => {
  const colors = ['primary', 'secondary', 'purple', 'blue'] as const
  const hash = props.asset.name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0)
  const colorIndex = hash % colors.length
  return colorMappings.glow[colors[colorIndex]]
})

defineEmits(['buy', 'sell'])
</script>

<template>
  <div
    v-motion
    :initial="{ opacity: 0, y: 30, scale: 0.95 }"
    :enter="{
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 500,
        delay: (index || 0) * 80,
        ease: 'easeOut',
      },
    }"
    class="glass-card group relative overflow-hidden rounded-2xl border border-white/10 bg-glass-gradient transition-all duration-300 hover:-translate-y-1.5"
    :class="cardGlow"
  >
    <div class="p-6">
      <div class="flex items-center justify-between">
        <!-- Asset info -->
        <div class="flex items-center">
          <div
            :class="[
              'flex h-12 w-12 items-center justify-center rounded-full font-semibold ring-1',
              iconBackground,
            ]"
          >
            {{ asset.ticker.substring(0, 3) }}
          </div>
          <div class="ml-3">
            <h3 class="font-medium text-white">{{ asset.name }}</h3>
            <p class="text-sm text-dark-300">{{ asset.quantity }} {{ asset.ticker }}</p>
          </div>
        </div>

        <!-- Price info -->
        <div class="text-right">
          <p class="font-medium text-white">{{ formatCurrency(asset.value) }}</p>
          <p :class="['text-sm', priceChangeClass]">
            {{ formatPercentage(asset.price_change_percentage_24h) }}
          </p>
        </div>
      </div>

      <!-- Current Price -->
      <div class="mt-6 flex justify-between border-t border-white/10 pt-4 text-sm">
        <span class="text-dark-300">Current Price</span>
        <span class="font-medium text-white">{{ formatCurrency(asset.current_price) }}</span>
      </div>
    </div>

    <!-- Action buttons -->
    <div class="flex border-t border-white/10">
      <button
        class="flex-1 py-3 text-sm font-medium text-primary-400 transition-colors hover:bg-white/5"
        @click="$emit('buy', asset)"
      >
        Buy More
      </button>
      <div class="w-px bg-white/10"></div>
      <button
        class="flex-1 py-3 text-sm font-medium text-danger-400 transition-colors hover:bg-white/5"
        @click="$emit('sell', asset)"
      >
        Sell
      </button>
    </div>
  </div>
</template>

<style scoped>
.glass-card {
  background-color: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.glass-card:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.1), transparent);
  border-radius: inherit;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.glass-card:hover:before {
  opacity: 1;
}
</style>
