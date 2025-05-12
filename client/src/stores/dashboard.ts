import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getAllAssetHoldingsForUser } from '@/services/apiService'

export interface Asset {
  id: number
  assetId: number
  name: string
  ticker: string
  quantity: number
  current_price: number
  value: number
  price_change_percentage_24h?: number
}

export const useDashboardStore = defineStore('dashboard', () => {
  const assets = ref<Asset[]>([])
  const totalValue = ref(0)
  const isLoading = ref(false)

  async function fetchAssets() {
    isLoading.value = true
    try {
      const userAssets = await getAllAssetHoldingsForUser()
      assets.value = userAssets

      // Calculate total portfolio value
      totalValue.value = userAssets.reduce((total, asset) => {
        const currentPrice = asset.current_price ?? 0
        return total + asset.quantity * currentPrice
      }, 0)
    } catch (error) {
      console.error('Error fetching assets:', error)
    } finally {
      isLoading.value = false
    }
  }

  return {
    assets,
    totalValue,
    isLoading,
    fetchAssets,
  }
})
