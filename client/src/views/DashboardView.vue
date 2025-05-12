<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import AssetCard from '@/components/dashboard/AssetCard.vue'
import { getAllAssetHoldingsForUser } from '@/services/apiService'
import type { Asset } from '@/components/AssetCard.vue'
import { getUserProfile } from '@/services/apiService'
import { useRouter } from 'vue-router'
import { useDashboardStore } from '@/stores/dashboard'
import { storeToRefs } from 'pinia'

const router = useRouter()
const dashboardStore = useDashboardStore()
const { assets, totalValue, isLoading } = storeToRefs(dashboardStore)

const username = ref<string>('')

// Statistics data
const stats = computed(() => [
  { name: 'Total Portfolio Value', value: formatCurrency(totalValue.value) },
  {
    name: 'Portfolio Change (24h)',
    value: formatPercentage(calculatePortfolioChange()),
    change: calculatePortfolioChange(),
    changeType: calculatePortfolioChange() >= 0 ? 'increase' : 'decrease',
  },
  { name: 'Total Assets', value: assets.value.length },
  { name: 'Last Updated', value: new Date().toLocaleTimeString() },
])

// Calculate the portfolio change percentage
function calculatePortfolioChange() {
  if (!assets.value.length) return 0

  const assetChanges = assets.value.map((asset) => {
    const changePercent = asset.price_change_percentage_24h || 0
    return (changePercent * asset.value) / 100
  })

  const totalChange = assetChanges.reduce((sum, change) => sum + change, 0)
  return totalValue.value > 0 ? (totalChange / totalValue.value) * 100 : 0
}

// Format currency
function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value || 0)
}

// Format percentage
function formatPercentage(value) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

// Fetch assets on component mount
onMounted(async () => {
  try {
    const userProfile = await getUserProfile()
    username.value = userProfile.username

    const userAssets: Asset[] = await getAllAssetHoldingsForUser()
    assets.value = userAssets

    totalValue.value = userAssets.reduce((total, asset) => {
      const currentPrice = asset.current_price ?? 0
      return total + asset.quantity * currentPrice
    }, 0)
  } catch (error) {
    console.error('Error fetching assets:', error)
  }
})

// Handle buy/sell actions
function handleBuy(asset) {
  router.push({
    name: 'AssetManage',
    query: { ticker: asset.ticker, action: 'buy' },
  })
}

function handleSell(asset) {
  router.push({
    name: 'AssetManage',
    query: { ticker: asset.ticker, action: 'sell' },
  })
}

onMounted(() => {
  dashboardStore.fetchAssets()
})
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="font-display text-3xl font-bold text-white">Dashboard</h1>
      <p class="mt-2 text-dark-300">Track and manage your cryptocurrency portfolio</p>
    </div>

    <!-- Stats cards -->
    <div class="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="(stat, index) in stats"
        :key="index"
        class="glass-card shadow-glow-white overflow-hidden rounded-xl border border-white/10 px-6 py-5"
      >
        <dt class="truncate text-sm font-medium text-dark-300">{{ stat.name }}</dt>
        <dd
          :class="[
            'mt-2 text-2xl font-semibold tracking-tight',
            stat.change !== undefined
              ? stat.changeType === 'increase'
                ? 'text-success-400'
                : 'text-danger-400'
              : 'text-white',
          ]"
        >
          {{ stat.value }}
        </dd>
      </div>
    </div>

    <!-- Loading state -->
    <div
      v-if="isLoading"
      class="glass-card shadow-glow-white flex justify-center rounded-xl border border-white/10 py-12"
    >
      <div class="flex items-center text-dark-300">
        <svg class="mr-2 h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        Loading your portfolio...
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!assets.length"
      class="glass-card shadow-glow-white rounded-xl border border-dashed border-white/20 p-8 text-center"
    >
      <div class="mx-auto h-12 w-12 text-dark-400">
        <svg class="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      </div>
      <h3 class="mt-2 text-sm font-medium text-white">No assets yet</h3>
      <p class="mt-1 text-sm text-dark-400">
        Get started by adding your first cryptocurrency asset.
      </p>
      <div class="mt-6">
        <router-link
          to="/dashboard/asset-manage"
          class="shadow-glow-primary inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
        >
          <svg class="-ml-0.5 mr-1.5 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Asset
        </router-link>
      </div>
    </div>

    <!-- Assets grid -->
    <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <AssetCard
        v-for="asset in assets"
        :key="asset.id"
        :asset="asset"
        @buy="handleBuy"
        @sell="handleSell"
      />
    </div>
  </div>
</template>

<style scoped>
.glass-card {
  background-color: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
</style>
