<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCurrentUserId } from '../utils/user'
import { getLivePrice } from '@/utils/getLivePrice'
import { assets } from '../assets/assets'
import type { Asset } from '../assets/assets'

const emit = defineEmits<{
  (
    e: 'submit',
    payload: {
      userId: number
      assetId: number
      quantity: number
      name: string
      ticker: string
      current_price: number
    }
  ): void
}>()

const userId = ref<number | null>(null)
const assetId = ref<number | null>(null)
const quantity = ref<number | null>(null)
const name = ref('')
const ticker = ref('')
const currentPrice = ref<number | null>(null)
const tickers = ref<string[]>([])

const errors = ref({
  quantity: '',
  name: '',
  ticker: '',
})

const validateFields = () => {
  errors.value = {
    quantity: '',
    name: '',
    ticker: '',
  }

  if (!quantity.value) {
    errors.value.quantity = 'Quantity is required and must be a number'
  }
  if (!name.value) {
    errors.value.name = 'Asset name is required'
  }
  if (!ticker.value) {
    errors.value.ticker = 'Ticker symbol is required'
  }

  return !errors.value.quantity && !errors.value.name && !errors.value.ticker
}

// Populate the userId using the getCurrentUserId function
onMounted(async () => {
  userId.value = getCurrentUserId()
  tickers.value = []
})

const fetchCurrentPrice = async () => {
  if (ticker.value) {
    currentPrice.value = (await getLivePrice(ticker.value)) || 0
  }
}

const handleSubmit = async (action: 'buy' | 'sell') => {
  if (!validateFields()) {
    return
  }
  if (!quantity.value) {
    return
  }
  await fetchCurrentPrice()
  const finalQuantity = action === 'sell' ? -quantity.value : quantity.value

  const payload = {
    userId: Number(userId.value),
    assetId: Number(assetId.value),
    quantity: finalQuantity,
    name: name.value,
    ticker: ticker.value,
    current_price: Number(currentPrice.value),
  }
  // Emit the payload to the parent component
  emit('submit', payload)

  // Reset form fields after submission
  quantity.value = null
  name.value = ''
  ticker.value = ''
  currentPrice.value = null
  assetId.value = null
}

const handleTickerInput = (event: Event) => {
  const input = (event.target as HTMLInputElement).value.toUpperCase()
  if (input) {
    tickers.value = assets
      .filter((asset: Asset) => asset.ticker.startsWith(input))
      .map((asset: Asset) => asset.ticker)
  } else {
    tickers.value = []
  }
}
// Updates the ticker variable and calculates the assetId based on the index of the ticker in the allTickers array
// Select a ticker from the filtered list
const selectTicker = async (selectedTicker: string) => {
  ticker.value = selectedTicker
  await fetchCurrentPrice()
  // Find the asset corresponding to the selected ticker
  const selectedAsset = assets.find((asset) => asset.ticker === selectedTicker)
  if (selectedAsset) {
    assetId.value = selectedAsset.assetId
  }
  tickers.value = [] // Hide dropdown after selection
}
</script>

<template>
  <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
    <div
      class="glass-card shadow-glow-white rounded-xl border border-white/10 p-8 sm:mx-auto sm:w-full sm:max-w-md"
    >
      <h2 class="mb-6 text-center font-display text-2xl font-bold text-white">
        Buy or Sell an Asset
      </h2>
      <form class="space-y-6" @submit.prevent>
        <!-- Hidden userId field & assetId field are automatically populated -->
        <input v-model="userId" type="hidden" id="userId" name="userId" />
        <input v-model="assetId" type="hidden" id="assetId" name="assetId" />

        <div>
          <label for="quantity" class="block text-sm font-medium text-dark-200">Quantity</label>
          <div class="mt-1">
            <input
              v-model="quantity"
              type="number"
              step="any"
              id="quantity"
              name="quantity"
              autocomplete="quantity"
              required
              class="mt-1 block w-full rounded-md border-white/10 bg-transparent px-3 py-2 text-white shadow-sm placeholder:text-dark-400 focus:border-dark-900 focus:ring-dark-900"
            />
            <span v-if="errors.quantity" class="text-sm text-danger-500">{{
              errors.quantity
            }}</span>
          </div>
        </div>

        <div>
          <label for="name" class="block text-sm font-medium text-dark-200">Asset Name</label>
          <div class="mt-1">
            <input
              v-model="name"
              type="text"
              id="name"
              name="name"
              autocomplete="name"
              required
              class="mt-1 block w-full rounded-md border-white/10 bg-transparent px-3 py-2 text-white shadow-sm placeholder:text-dark-400 focus:border-dark-900 focus:ring-dark-900"
            />
            <span v-if="errors.name" class="text-sm text-danger-500">{{ errors.name }}</span>
          </div>
        </div>

        <div>
          <label for="ticker" class="block text-sm font-medium text-dark-200">Ticker Symbol</label>
          <div class="relative mt-1">
            <input
              v-model="ticker"
              @input="handleTickerInput"
              type="text"
              id="ticker"
              name="ticker"
              autocomplete="off"
              required
              class="mt-1 block w-full rounded-md border-white/10 bg-transparent px-3 py-2 text-white shadow-sm placeholder:text-dark-400 focus:border-dark-900 focus:ring-dark-900"
            />
            <ul
              v-if="tickers.length > 0"
              class="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-white/10 bg-dark-800/30 shadow-lg backdrop-blur-md"
            >
              <li
                v-for="(item, index) in tickers"
                :key="index"
                @click="selectTicker(item)"
                class="cursor-pointer px-3 py-2 text-white hover:bg-white/10"
              >
                {{ item }}
              </li>
            </ul>
            <span v-if="errors.ticker" class="text-sm text-danger-500">{{ errors.ticker }}</span>
          </div>
        </div>

        <div>
          <label for="currentPrice" class="block text-sm font-medium text-dark-200"
            >Current Price</label
          >
          <div class="mt-1">
            <p
              class="mt-1 block w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-white"
            >
              {{ currentPrice !== null ? `$${currentPrice.toFixed(2)}` : 'N/A' }}
            </p>
          </div>
        </div>

        <div class="flex justify-between gap-4">
          <button
            type="button"
            @click="handleSubmit('buy')"
            class="shadow-glow-success flex w-full justify-center rounded-md bg-success-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-success-500"
          >
            Buy
          </button>
          <button
            type="button"
            @click="handleSubmit('sell')"
            class="shadow-glow-danger flex w-full justify-center rounded-md bg-danger-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-danger-500"
          >
            Sell
          </button>
        </div>
      </form>
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
