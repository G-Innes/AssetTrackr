<script setup lang="ts">
import { computed } from 'vue'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/vue/24/outline'

export interface Asset {
  id: number
  name: string
  ticker: string
  current_price: number
}

export interface Transaction {
  id: number
  transactionType: string
  quantity: number
  price: string | number
  transaction_date: string
  assetId: number
  assetTicker: string
}

const props = defineProps<{
  transaction: Transaction
  index?: number
}>()

const isBuy = computed(() => props.transaction.transactionType.toLowerCase() === 'buy')

const formattedPrice = computed(() => {
  const price = props.transaction.price
  return typeof price === 'number' ? price.toFixed(2) : price
})

const formattedDate = computed(() => {
  const date = new Date(props.transaction.transaction_date)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
})

const totalValue = computed(() => {
  const price =
    typeof props.transaction.price === 'number'
      ? props.transaction.price
      : parseFloat(props.transaction.price)
  return (price * props.transaction.quantity).toFixed(2)
})
</script>

<template>
  <div
    v-motion
    :initial="{ opacity: 0, y: 20, scale: 0.95 }"
    :enter="{
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 400,
        delay: (index || 0) * 50,
        ease: 'easeOut',
      },
    }"
    :class="['transaction-card group', isBuy ? 'transaction-card--buy' : 'transaction-card--sell']"
  >
    <!-- Transaction Type Badge -->
    <div class="mb-4 flex items-center justify-between">
      <div
        :class="[
          'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold',
          isBuy ? 'bg-success-500/20 text-success-400' : 'bg-danger-500/20 text-danger-400',
        ]"
      >
        <component :is="isBuy ? ArrowTrendingUpIcon : ArrowTrendingDownIcon" class="h-4 w-4" />
        {{ transaction.transactionType.toUpperCase() }}
      </div>
      <span class="text-sm text-dark-400">{{ formattedDate }}</span>
    </div>

    <!-- Asset Info -->
    <div class="mb-4 flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold text-white transition-colors group-hover:text-primary-400">
          {{ transaction.assetTicker }}
        </h3>
        <p class="text-sm text-dark-400">
          {{ transaction.quantity }} units @ ${{ formattedPrice }}
        </p>
      </div>
      <div class="text-right">
        <p :class="['text-xl font-bold', isBuy ? 'text-success-400' : 'text-danger-400']">
          {{ isBuy ? '+' : '-' }}${{ totalValue }}
        </p>
      </div>
    </div>

    <!-- Subtle glow line at bottom -->
    <div
      :class="[
        'absolute bottom-0 left-0 right-0 h-0.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100',
        isBuy
          ? 'bg-gradient-to-r from-transparent via-success-500 to-transparent'
          : 'bg-gradient-to-r from-transparent via-danger-500 to-transparent',
      ]"
    />
  </div>
</template>

<style scoped>
.transaction-card {
  @apply relative overflow-hidden rounded-2xl border border-white/10 p-5;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: all 0.3s ease-out;
}

.transaction-card:hover {
  @apply -translate-y-1 border-white/20;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.05) 100%);
}

.transaction-card--buy:hover {
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.3),
    0 0 30px rgba(16, 185, 129, 0.1);
}

.transaction-card--sell:hover {
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.3),
    0 0 30px rgba(239, 68, 68, 0.1);
}
</style>
