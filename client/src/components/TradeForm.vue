<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { api } from '@/services/api'
import { formatCurrency, formatPercent, toDateInputValue } from '@/utils/format'
import type { MarketAsset, NewTransaction, Transaction, TransactionType } from '@/types'

const props = defineProps<{
  /** Editing this transaction rather than recording a new one */
  transaction?: Transaction
  initialTicker?: string
  initialType?: TransactionType
  isSubmitting?: boolean
}>()

const emit = defineEmits<{
  submit: [payload: NewTransaction]
  cancel: []
}>()

const isEditing = computed(() => !!props.transaction)
const today = toDateInputValue()
const originalDate = props.transaction ? toDateInputValue(props.transaction.executedAt) : today

const type = ref<TransactionType>(props.transaction?.type ?? props.initialType ?? 'buy')
const quantity = ref(props.transaction?.quantity ?? '')
const price = ref(props.transaction?.price ?? '')
const date = ref(originalDate)
const note = ref(props.transaction?.note ?? '')
const errors = ref({ asset: '', quantity: '', price: '', date: '' })

// ---- asset search
const search = ref(props.transaction?.asset.ticker ?? '')
const selected = ref<{ ticker: string; name: string } | null>(props.transaction?.asset ?? null)
const results = ref<MarketAsset[]>([])
const isOpen = ref(false)
const highlighted = ref(0)
const searchFailed = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | undefined
let latestSearch = 0

async function runSearch(term: string) {
  const request = ++latestSearch
  try {
    const found = await api.searchAssets(term.trim())
    if (request !== latestSearch) return found
    results.value = found
    searchFailed.value = false
    highlighted.value = 0
    return found
  } catch {
    if (request === latestSearch) {
      results.value = []
      searchFailed.value = true
    }
    return []
  }
}

function handleSearchInput() {
  selected.value = null
  errors.value.asset = ''
  isOpen.value = true
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => runSearch(search.value), 200)
}

function openList() {
  if (isEditing.value) return
  isOpen.value = true
  if (!results.value.length) runSearch(search.value)
}

function choose(asset: { ticker: string; name: string }) {
  selected.value = { ticker: asset.ticker, name: asset.name }
  search.value = asset.ticker
  isOpen.value = false
  errors.value.asset = ''
}

/** Typing "btc" and tabbing away should count as choosing Bitcoin. */
async function resolveTyped() {
  if (selected.value) return true
  const term = search.value.trim().toUpperCase()
  if (!term) return false
  clearTimeout(searchTimer)
  const found = await runSearch(term)
  const exact = found.find((asset) => asset.ticker === term)
  if (exact) choose(exact)
  return !!exact
}

function handleSearchBlur() {
  // Give a click on an option time to land before the list closes
  setTimeout(() => {
    isOpen.value = false
    resolveTyped()
  }, 150)
}

function handleSearchKey(event: KeyboardEvent) {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    if (!isOpen.value) return openList()
    const step = event.key === 'ArrowDown' ? 1 : -1
    const count = results.value.length || 1
    highlighted.value = (highlighted.value + step + count) % count
  } else if (event.key === 'Enter' && isOpen.value && results.value[highlighted.value]) {
    event.preventDefault()
    choose(results.value[highlighted.value])
  } else if (event.key === 'Escape') {
    isOpen.value = false
  }
}

// ---- price: follows the market until the user types their own
const priceEdited = ref(isEditing.value)
const marketPrice = ref<number | null>(null)
const priceStatus = ref<'idle' | 'loading' | 'found' | 'missing'>('idle')
let latestPriceLookup = 0

async function lookUpPrice() {
  const lookup = ++latestPriceLookup
  marketPrice.value = null
  if (!selected.value || !date.value) {
    priceStatus.value = 'idle'
    return
  }
  priceStatus.value = 'loading'
  const found = await api.getPrice(
    selected.value.ticker,
    date.value === today ? undefined : date.value
  )
  if (lookup !== latestPriceLookup) return
  marketPrice.value = found
  priceStatus.value = found === null ? 'missing' : 'found'
  if (found !== null && !priceEdited.value) price.value = String(found)
}

function useMarketPrice() {
  if (marketPrice.value === null) return
  price.value = String(marketPrice.value)
  priceEdited.value = false
  errors.value.price = ''
}

watch([selected, date], () => {
  if (!priceEdited.value) price.value = ''
  lookUpPrice()
})

const total = computed(() => {
  const amount = Number(quantity.value) * Number(price.value)
  return quantity.value !== '' && price.value !== '' && Number.isFinite(amount) ? amount : null
})

const priceHint = computed(() => {
  if (priceStatus.value === 'loading') return 'Looking up the market price…'
  if (priceStatus.value === 'missing') return 'No market price found for that day. Enter your own.'
  if (priceStatus.value === 'found' && marketPrice.value !== null) {
    const when = date.value === today ? 'now' : 'at that day’s close'
    return `Market price ${when}: ${formatCurrency(marketPrice.value)}`
  }
  return ''
})

// ---- submit
function isPositive(value: string) {
  return String(value).trim() !== '' && Number.isFinite(Number(value)) && Number(value) > 0
}

async function handleSubmit() {
  if (props.isSubmitting) return
  const hasAsset = await resolveTyped()
  errors.value = {
    asset: hasAsset ? '' : 'Choose an asset from the list',
    quantity: isPositive(quantity.value) ? '' : 'Enter a quantity greater than zero',
    price:
      String(price.value).trim() !== '' &&
      Number.isFinite(Number(price.value)) &&
      Number(price.value) >= 0
        ? ''
        : 'Enter the price paid per coin',
    date: date.value && date.value <= today ? '' : 'Choose a date that is not in the future',
  }
  if (Object.values(errors.value).some(Boolean) || !selected.value) return

  const payload: NewTransaction = {
    ticker: selected.value.ticker,
    type: type.value,
    quantity: String(quantity.value),
    price: String(price.value),
    note: note.value.trim(),
  }
  // Today's trades are stamped with the current time by the server; a trade
  // on another day is placed at midday so it stays on that day in any time zone.
  if (date.value !== originalDate || (!isEditing.value && date.value !== today)) {
    payload.executedAt = new Date(`${date.value}T12:00:00`).toISOString()
  }
  emit('submit', payload)
}

/** Called by the parent once a trade has been recorded. */
function reset() {
  quantity.value = ''
  note.value = ''
  priceEdited.value = false
  errors.value = { asset: '', quantity: '', price: '', date: '' }
  lookUpPrice()
}
defineExpose({ reset })

onMounted(async () => {
  if (isEditing.value) return lookUpPrice()
  if (props.initialTicker) {
    search.value = props.initialTicker.toUpperCase()
    await resolveTyped()
  }
})
onBeforeUnmount(() => clearTimeout(searchTimer))
</script>

<template>
  <form class="space-y-5" novalidate @submit.prevent="handleSubmit">
    <!-- Buy / sell -->
    <div class="grid grid-cols-2 gap-1 rounded-lg bg-white/5 p-1" role="group" aria-label="Type">
      <button
        v-for="option in ['buy', 'sell'] as const"
        :key="option"
        type="button"
        :aria-pressed="type === option"
        class="rounded-md py-2 text-sm font-semibold capitalize transition-colors"
        :class="
          type === option
            ? option === 'buy'
              ? 'bg-success-600 text-white'
              : 'bg-danger-600 text-white'
            : 'text-dark-300 hover:text-white'
        "
        @click="type = option"
      >
        {{ option }}
      </button>
    </div>

    <!-- Asset -->
    <div>
      <label for="trade-asset" class="field-label">Asset</label>
      <div class="relative">
        <input
          id="trade-asset"
          v-model="search"
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-controls="trade-asset-options"
          :aria-expanded="isOpen"
          :aria-invalid="!!errors.asset"
          autocomplete="off"
          autocapitalize="characters"
          placeholder="Search by name or ticker, e.g. Bitcoin"
          maxlength="40"
          :disabled="isEditing"
          class="field disabled:opacity-60"
          @input="handleSearchInput"
          @focus="openList"
          @blur="handleSearchBlur"
          @keydown="handleSearchKey"
        />
        <ul
          v-if="isOpen && !isEditing"
          id="trade-asset-options"
          role="listbox"
          class="bg-dark-800 absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-white/10 py-1 shadow-xl"
        >
          <li
            v-for="(asset, index) in results"
            :key="asset.ticker"
            role="option"
            :aria-selected="index === highlighted"
            class="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm"
            :class="index === highlighted ? 'bg-white/10' : ''"
            @pointerenter="highlighted = index"
            @mousedown.prevent="choose(asset)"
          >
            <span class="w-14 shrink-0 font-semibold text-white">{{ asset.ticker }}</span>
            <span class="text-dark-300 min-w-0 flex-1 truncate">{{ asset.name }}</span>
            <span v-if="asset.price !== null" class="num text-right text-white">
              {{ formatCurrency(asset.price) }}
              <span
                v-if="asset.change24h !== null"
                class="block text-xs"
                :class="asset.change24h < 0 ? 'text-danger-400' : 'text-success-400'"
              >
                {{ formatPercent(asset.change24h) }}
              </span>
            </span>
          </li>
          <li v-if="!results.length" class="text-dark-400 px-3 py-2 text-sm">
            {{
              searchFailed
                ? 'Could not reach the price service. Try again shortly.'
                : 'No matching assets'
            }}
          </li>
        </ul>
      </div>
      <p v-if="selected" class="text-dark-300 mt-1 text-sm">{{ selected.name }}</p>
      <p v-if="errors.asset" class="text-danger-400 mt-1 text-sm" role="alert">
        {{ errors.asset }}
      </p>
    </div>

    <div class="grid gap-5 sm:grid-cols-2">
      <div>
        <label for="trade-quantity" class="field-label">Quantity</label>
        <input
          id="trade-quantity"
          v-model="quantity"
          type="text"
          inputmode="decimal"
          autocomplete="off"
          placeholder="0.00"
          :aria-invalid="!!errors.quantity"
          class="field num"
          @input="errors.quantity = ''"
        />
        <p v-if="errors.quantity" class="text-danger-400 mt-1 text-sm" role="alert">
          {{ errors.quantity }}
        </p>
      </div>

      <div>
        <label for="trade-date" class="field-label">Date</label>
        <input
          id="trade-date"
          v-model="date"
          type="date"
          :max="today"
          min="2009-01-03"
          :aria-invalid="!!errors.date"
          class="field"
        />
        <p v-if="errors.date" class="text-danger-400 mt-1 text-sm" role="alert">
          {{ errors.date }}
        </p>
      </div>
    </div>

    <div>
      <label for="trade-price" class="field-label">Price per coin (USD)</label>
      <input
        id="trade-price"
        v-model="price"
        type="text"
        inputmode="decimal"
        autocomplete="off"
        placeholder="0.00"
        :aria-invalid="!!errors.price"
        aria-describedby="trade-price-hint"
        class="field num"
        @input="((priceEdited = true), (errors.price = ''))"
      />
      <p id="trade-price-hint" class="text-dark-400 mt-1 text-sm" aria-live="polite">
        {{ priceHint }}
        <button
          v-if="priceEdited && marketPrice !== null && String(marketPrice) !== String(price)"
          type="button"
          class="text-primary-400 hover:text-primary-300 ml-1 underline"
          @click="useMarketPrice"
        >
          Use it
        </button>
      </p>
      <p v-if="errors.price" class="text-danger-400 mt-1 text-sm" role="alert">
        {{ errors.price }}
      </p>
    </div>

    <div>
      <label for="trade-note" class="field-label">
        Note <span class="text-dark-500 font-normal">(optional)</span>
      </label>
      <input
        id="trade-note"
        v-model="note"
        type="text"
        maxlength="200"
        autocomplete="off"
        placeholder="e.g. Monthly buy"
        class="field"
      />
    </div>

    <div class="flex items-center justify-between border-t border-white/10 pt-4">
      <div>
        <p class="text-dark-400 text-xs">Total</p>
        <p class="num text-lg font-semibold text-white">
          {{ total === null ? '-' : formatCurrency(total) }}
        </p>
      </div>
      <div class="flex gap-2">
        <button v-if="isEditing" type="button" class="btn-quiet" @click="emit('cancel')">
          Cancel
        </button>
        <button
          type="submit"
          :disabled="isSubmitting"
          :class="isEditing || type === 'buy' ? 'btn-primary' : 'btn-danger'"
        >
          <template v-if="isEditing">Save changes</template>
          <template v-else>{{ type === 'buy' ? 'Record buy' : 'Record sell' }}</template>
        </button>
      </div>
    </div>
  </form>
</template>
