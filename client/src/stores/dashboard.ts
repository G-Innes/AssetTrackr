import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { api } from '@/services/api'
import { getLivePrice } from '@/utils/getLivePrice'

/** A holding joined with its live price, ready to display. */
export interface Asset {
  id: number
  name: string
  ticker: string
  quantity: number
  /** null when no live price could be fetched */
  current_price: number | null
  value: number | null
}

export const useDashboardStore = defineStore('dashboard', () => {
  const assets = ref<Asset[]>([])
  const isLoading = ref(false)
  const error = ref('')
  const lastUpdated = ref<Date | null>(null)

  // Assets without a live price are left out of the total rather than counted as $0.
  const totalValue = computed(() =>
    assets.value.reduce((sum, asset) => sum + (asset.value ?? 0), 0)
  )
  const hasUnpricedAssets = computed(() => assets.value.some((asset) => asset.value === null))

  async function fetchAssets() {
    isLoading.value = true
    error.value = ''
    try {
      const holdings = await api.getHoldings()
      assets.value = await Promise.all(
        holdings.map(async (holding) => {
          const quantity = Number(holding.quantity)
          const price = await getLivePrice(holding.asset.ticker)
          return {
            id: holding.asset.id,
            name: holding.asset.name,
            ticker: holding.asset.ticker,
            quantity,
            current_price: price,
            value: price === null ? null : price * quantity,
          }
        })
      )
      lastUpdated.value = new Date()
    } catch {
      error.value = 'Could not load your portfolio. Please try again.'
    } finally {
      isLoading.value = false
    }
  }

  function reset() {
    assets.value = []
    lastUpdated.value = null
    error.value = ''
  }

  return {
    assets,
    totalValue,
    hasUnpricedAssets,
    isLoading,
    error,
    lastUpdated,
    fetchAssets,
    reset,
  }
})
