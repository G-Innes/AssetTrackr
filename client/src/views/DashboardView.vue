<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { FwbAlert } from 'flowbite-vue'
import AssetCard from '../components/AssetCard.vue'
import { getAllAssetHoldingsForUser } from '@/services/apiService'
import type { Asset } from '@/components/AssetCard.vue'
import { getUserProfile } from '@/services/apiService'
import { logout } from '../services/apiService'
import { useRouter } from 'vue-router'

const router = useRouter()

const colors = [
  '#A0E7E5', // Pastel Turquoise
  '#FFB3BA', // Pastel Pink
  '#FFFACD', // Pastel Lemon
  '#CABBE9', // Pastel Purple
  '#FFDAC1', // Pastel Orange
  '#DECBE4', // Pastel Raspberry
  '#A0C4FF', // Pastel Blue
  '#C1E1C1', // Pastel Green
  '#E6F2FF', // Pastel Prussian Blue
  '#B2F2BB', // Pastel Mint
  '#E3D5FF', // Pastel Lavender
  '#FFD1BA', // Pastel Peach
]

const assets = ref<Asset[]>([])
const username = ref<string>('')
const totalPortfolioValue = ref<number>(0)

// Fetch assets on component mount
onMounted(async () => {
  try {
    const userProfile = await getUserProfile()
    username.value = userProfile.username

    const userAssets: Asset[] = await getAllAssetHoldingsForUser()
    assets.value = userAssets

    totalPortfolioValue.value = userAssets.reduce((total, asset) => {
      const currentPrice = asset.current_price ?? 0
      return total + asset.quantity * currentPrice
    }, 0)
  } catch (error) {
    console.error('Error fetching assets:', error)
  }
})

function getColor(index: number): string {
  return colors[index % colors.length]
}

function logoutUser() {
  logout()
  router.push({ name: 'Login' })
  location.reload()
}
</script>

<template>
  <div class="DashboardView p-4">
    <div class="mt-4 flex flex-row justify-end">
      <FwbButton
        class="PLSB memphis-card-btn flex cursor-pointer justify-center bg-red-500 px-4 py-2 text-white hover:bg-white hover:text-black"
        @click.prevent="logoutUser"
        link="#"
        >Logout
      </FwbButton>
    </div>
  </div>
  <div class="memphis-card mb-16 flex w-auto flex-col items-center justify-center text-center">
    <h1 class="text-3xl font-bold">Welcome, {{ username }}</h1>
    <p class="mt-2 text-xl">
      Your total portfolio value today is:
      <span class="font-semibold">${{ totalPortfolioValue.toFixed(2) }}</span>
    </p>
  </div>

  <div v-if="assets.length === 0">
    <FwbAlert class="text-black-bold">No assets yet!</FwbAlert>
  </div>

  <div v-else class="PLS grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
    <AssetCard
      v-for="(asset, index) in assets"
      :key="asset.assetId"
      :asset="asset"
      :card-color="getColor(index)"
    />
  </div>
</template>

<style scoped>
.memphis-card {
  background-color: #cccccc;
  color: #121212;
  box-shadow: 10px 10px 0 #121212;
  border-radius: 10px;
  transition: transform 0.2s;
  display: flex;
  flex-direction: column;
  padding: 2rem;
}

.memphis-card-btn {
  box-shadow: 5px 5px 0 #121212;
  border-radius: 5px;
  transition: transform 0.2s;
}
</style>
