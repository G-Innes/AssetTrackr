<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import AssetCard from '@/components/dashboard/AssetCard.vue'
import { Skeleton } from '@/components/ui'
import { useDashboardStore } from '@/stores/dashboard'
import { formatCurrency } from '@/utils/format'

const router = useRouter()
const dashboardStore = useDashboardStore()
const { assets, totalValue, hasUnpricedAssets, isLoading, error, lastUpdated } =
  storeToRefs(dashboardStore)

const stats = computed(() => [
  {
    name: 'Total Portfolio Value',
    value: formatCurrency(totalValue.value),
    hint: hasUnpricedAssets.value ? 'Excludes assets without a live price' : '',
  },
  { name: 'Assets Held', value: String(assets.value.length), hint: '' },
  {
    name: 'Prices Updated',
    value: lastUpdated.value ? lastUpdated.value.toLocaleTimeString() : '-',
    hint: '',
  },
])

function manage(asset: { ticker: string }, action: 'buy' | 'sell') {
  router.push({ name: 'AssetManage', query: { ticker: asset.ticker, action } })
}

onMounted(() => dashboardStore.fetchAssets())
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="font-display text-3xl font-bold text-white">Dashboard</h1>
      <p class="mt-2 text-dark-300">Track and manage your cryptocurrency portfolio</p>
    </div>

    <!-- Stats cards -->
    <div v-if="!isLoading" class="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="(stat, index) in stats"
        :key="index"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: index * 100 } }"
        class="glass-card shadow-glow-white overflow-hidden rounded-xl border border-white/10 px-6 py-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
      >
        <dt class="truncate text-sm font-medium text-dark-300">{{ stat.name }}</dt>
        <dd class="mt-2 text-2xl font-semibold tracking-tight text-white">{{ stat.value }}</dd>
        <p v-if="stat.hint" class="mt-1 text-xs text-dark-400">{{ stat.hint }}</p>
      </div>
    </div>

    <!-- Loading state with skeletons -->
    <template v-if="isLoading">
      <!-- Skeleton stat cards -->
      <div class="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="i in 3"
          :key="i"
          class="glass-card overflow-hidden rounded-xl border border-white/10 px-6 py-5"
        >
          <Skeleton width="60%" height="0.875rem" rounded="sm" />
          <Skeleton width="80%" height="2rem" rounded="md" class="mt-3" />
        </div>
      </div>

      <!-- Skeleton asset cards -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="i in 6"
          :key="i"
          class="glass-card overflow-hidden rounded-2xl border border-white/10 p-6"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <Skeleton width="3rem" height="3rem" rounded="full" />
              <div class="ml-3">
                <Skeleton width="6rem" height="1rem" rounded="sm" />
                <Skeleton width="4rem" height="0.875rem" rounded="sm" class="mt-2" />
              </div>
            </div>
            <div class="text-right">
              <Skeleton width="5rem" height="1rem" rounded="sm" />
              <Skeleton width="3rem" height="0.875rem" rounded="sm" class="ml-auto mt-2" />
            </div>
          </div>
          <div class="mt-6 flex justify-between border-t border-white/10 pt-4">
            <Skeleton width="5rem" height="0.875rem" rounded="sm" />
            <Skeleton width="4rem" height="0.875rem" rounded="sm" />
          </div>
          <div class="mt-4 flex gap-2 border-t border-white/10 pt-3">
            <Skeleton width="100%" height="2.5rem" rounded="md" />
            <Skeleton width="100%" height="2.5rem" rounded="md" />
          </div>
        </div>
      </div>
    </template>

    <!-- Error state -->
    <div
      v-else-if="error"
      class="rounded-xl border border-danger-500/30 bg-danger-600/10 p-6 text-center"
      role="alert"
    >
      <p class="text-sm text-white">{{ error }}</p>
      <button
        class="mt-4 rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20"
        @click="dashboardStore.fetchAssets()"
      >
        Try again
      </button>
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
        v-for="(asset, index) in assets"
        :key="asset.id"
        :asset="asset"
        :index="index"
        @buy="manage($event, 'buy')"
        @sell="manage($event, 'sell')"
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
