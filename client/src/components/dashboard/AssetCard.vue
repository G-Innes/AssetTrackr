<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  asset: {
    type: Object,
    required: true,
  },
})

// Computed property to determine if the price change is positive or negative
const priceChangeClass = computed(() => {
  if (!props.asset.price_change_percentage_24h) return 'text-dark-300'
  return props.asset.price_change_percentage_24h >= 0 ? 'text-success-400' : 'text-danger-400'
})

// Format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

// Format percentage
const formatPercentage = (value) => {
  if (!value) return '0.00%'
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

// Generate a background color based on asset name for the icon
const iconBackground = computed(() => {
  const colors = ['primary', 'secondary', 'success', 'danger']
  const hash = props.asset.name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0)
  const colorIndex = hash % colors.length
  return `bg-${colors[colorIndex]}-500/20 text-${colors[colorIndex]}-400 ring-${colors[colorIndex]}-500/30`
})

// Generate a glow effect based on asset name
const cardGlow = computed(() => {
  const colors = ['primary', 'secondary', 'purple', 'blue']
  const hash = props.asset.name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0)
  const colorIndex = hash % colors.length
  return `shadow-glow-${colors[colorIndex]}`
})
</script>

<template>
  <div
    class="glass-card group relative overflow-hidden rounded-xl border border-white/10 bg-glass-gradient transition-all duration-300 hover:-translate-y-1"
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
