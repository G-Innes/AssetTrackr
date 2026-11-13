<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getLivePrice } from '@/utils/getLivePrice'
import { formatCurrency } from '@/utils/format'
import { assets } from '../assets/assets'
import type { NewTransaction, TransactionType } from '@/types'

const props = defineProps<{
  /** Ticker to start with, e.g. when arriving from a holding's "Buy more" */
  initialTicker?: string
  isSubmitting?: boolean
}>()

const emit = defineEmits<{
  submit: [payload: NewTransaction]
}>()

const quantity = ref('')
const ticker = ref('')
const currentPrice = ref<number | null>(null)
const isFetchingPrice = ref(false)
const showSuggestions = ref(false)
const errors = ref({ quantity: '', ticker: '' })

const suggestions = computed(() => {
  const input = ticker.value.trim().toUpperCase()
  if (!input) return []
  return assets
    .filter((asset) => asset.ticker.startsWith(input) || asset.name.toUpperCase().startsWith(input))
    .slice(0, 8)
})

const assetName = computed(
  () => assets.find((asset) => asset.ticker === ticker.value.trim().toUpperCase())?.name
)

// Only the latest lookup may set the price: typing "ET" then "ETH" starts two.
let latestLookup = 0
async function fetchCurrentPrice() {
  const symbol = ticker.value.trim().toUpperCase()
  const lookup = ++latestLookup
  currentPrice.value = null
  if (!symbol) return
  isFetchingPrice.value = true
  const price = await getLivePrice(symbol)
  if (lookup !== latestLookup) return
  currentPrice.value = price
  isFetchingPrice.value = false
}

function handleTickerInput() {
  ticker.value = ticker.value.toUpperCase()
  showSuggestions.value = true
  errors.value.ticker = ''
}

function selectTicker(selected: string) {
  ticker.value = selected
  showSuggestions.value = false
  fetchCurrentPrice()
}

function handleTickerBlur() {
  // Wait for a click on a suggestion to register before hiding the list.
  setTimeout(() => {
    showSuggestions.value = false
  }, 150)
  fetchCurrentPrice()
}

function validate(): boolean {
  const symbol = ticker.value.trim().toUpperCase()
  const amount = Number(quantity.value)
  errors.value = {
    quantity:
      quantity.value !== '' && Number.isFinite(amount) && amount > 0
        ? ''
        : 'Enter a quantity greater than zero',
    ticker: /^[A-Z0-9]{1,12}$/.test(symbol) ? '' : 'Enter a ticker symbol, e.g. BTC',
  }
  return !errors.value.quantity && !errors.value.ticker
}

async function handleSubmit(type: TransactionType) {
  if (props.isSubmitting || !validate()) return

  await fetchCurrentPrice()
  if (currentPrice.value === null) {
    // Recording a trade at $0 would silently corrupt the portfolio's history.
    errors.value.ticker = `No live price found for ${ticker.value}. Check the ticker symbol.`
    return
  }

  emit('submit', {
    ticker: ticker.value.trim().toUpperCase(),
    name: assetName.value,
    type,
    quantity: String(quantity.value),
    price: String(currentPrice.value),
  })
}

/** Called by the parent once a trade has been recorded. */
function reset() {
  quantity.value = ''
  errors.value = { quantity: '', ticker: '' }
}
defineExpose({ reset })

onMounted(() => {
  if (props.initialTicker) selectTicker(props.initialTicker.toUpperCase())
})
</script>

<template>
  <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
    <div
      class="glass-card shadow-glow-white rounded-xl border border-white/10 p-8 sm:mx-auto sm:w-full sm:max-w-md"
    >
      <h2 class="mb-6 text-center font-display text-2xl font-bold text-white">
        Buy or Sell an Asset
      </h2>
      <form class="space-y-6" novalidate @submit.prevent>
        <div>
          <label for="ticker" class="block text-sm font-medium text-dark-200">Ticker Symbol</label>
          <div class="relative mt-1">
            <input
              v-model="ticker"
              @input="handleTickerInput"
              @blur="handleTickerBlur"
              type="text"
              id="ticker"
              name="ticker"
              autocomplete="off"
              autocapitalize="characters"
              placeholder="BTC"
              maxlength="12"
              :aria-invalid="!!errors.ticker"
              aria-describedby="ticker-error"
              class="mt-1 block w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-white shadow-sm placeholder:text-dark-400 focus:border-primary-500/50 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <ul
              v-if="showSuggestions && suggestions.length > 0"
              class="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-white/10 bg-dark-800/90 shadow-lg backdrop-blur-md"
            >
              <li v-for="item in suggestions" :key="item.ticker">
                <button
                  type="button"
                  class="flex w-full justify-between px-3 py-2 text-left text-white hover:bg-white/10"
                  @mousedown.prevent="selectTicker(item.ticker)"
                >
                  <span>{{ item.ticker }}</span>
                  <span class="text-dark-300">{{ item.name }}</span>
                </button>
              </li>
            </ul>
            <p v-if="assetName" class="mt-1 text-sm text-dark-300">{{ assetName }}</p>
            <p v-if="errors.ticker" id="ticker-error" class="mt-1 text-sm text-danger-400">
              {{ errors.ticker }}
            </p>
          </div>
        </div>

        <div>
          <label for="quantity" class="block text-sm font-medium text-dark-200">Quantity</label>
          <div class="mt-1">
            <input
              v-model="quantity"
              type="number"
              step="any"
              min="0"
              inputmode="decimal"
              id="quantity"
              name="quantity"
              autocomplete="off"
              placeholder="0.00"
              :aria-invalid="!!errors.quantity"
              aria-describedby="quantity-error"
              class="mt-1 block w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-white shadow-sm placeholder:text-dark-400 focus:border-primary-500/50 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <p v-if="errors.quantity" id="quantity-error" class="mt-1 text-sm text-danger-400">
              {{ errors.quantity }}
            </p>
          </div>
        </div>

        <div>
          <span class="block text-sm font-medium text-dark-200">Current Price</span>
          <p
            class="mt-2 block w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-white"
            aria-live="polite"
          >
            <template v-if="isFetchingPrice">Fetching…</template>
            <template v-else-if="currentPrice !== null">{{
              formatCurrency(currentPrice)
            }}</template>
            <template v-else>N/A</template>
          </p>
          <p
            v-if="currentPrice !== null && Number(quantity) > 0"
            class="mt-1 text-sm text-dark-300"
          >
            Total: {{ formatCurrency(currentPrice * Number(quantity)) }}
          </p>
        </div>

        <div class="flex justify-between gap-4">
          <button
            type="button"
            :disabled="isSubmitting"
            @click="handleSubmit('buy')"
            class="shadow-glow-success flex w-full justify-center rounded-md bg-success-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-success-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Buy
          </button>
          <button
            type="button"
            :disabled="isSubmitting"
            @click="handleSubmit('sell')"
            class="shadow-glow-danger flex w-full justify-center rounded-md bg-danger-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-danger-500 disabled:cursor-not-allowed disabled:opacity-60"
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
