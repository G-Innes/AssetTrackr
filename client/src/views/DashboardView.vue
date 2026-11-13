<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import AllocationDonut from '@/components/charts/AllocationDonut.vue'
import ValueChart from '@/components/charts/ValueChart.vue'
import { Change, ConfirmDialog, Skeleton } from '@/components/ui'
import { api, getErrorMessage } from '@/services/api'
import { usePortfolioStore } from '@/stores/portfolio'
import { formatCurrency, formatQuantity } from '@/utils/format'
import type { HistoryRange, Holding } from '@/types'

const store = usePortfolioStore()
const { portfolio, history, range, isLoading, isLoadingHistory, error } = storeToRefs(store)

const ranges: { value: HistoryRange; label: string }[] = [
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
  { value: '1y', label: '1Y' },
]

const totals = computed(() => portfolio.value?.totals)
const holdings = computed(() => portfolio.value?.holdings ?? [])
const unpriced = computed(() => portfolio.value?.unpriced ?? [])
// Keep showing what we have while a refresh is in flight
const isFirstLoad = computed(() => isLoading.value && !portfolio.value)

// ---- removing an asset and its whole history
const removing = ref<Holding | null>(null)
const removeError = ref('')
const isRemoving = ref(false)

async function confirmRemove() {
  if (!removing.value) return
  isRemoving.value = true
  removeError.value = ''
  try {
    await api.removeAsset(removing.value.asset.id)
    removing.value = null
    await store.load()
  } catch (failure) {
    removeError.value = getErrorMessage(failure, 'Could not remove the asset. Please try again.')
  } finally {
    isRemoving.value = false
  }
}

onMounted(() => store.load())
</script>

<template>
  <div class="mx-auto max-w-6xl">
    <div class="mb-6 flex items-center justify-between gap-4">
      <h1 class="font-display text-2xl font-bold text-white">Portfolio</h1>
      <router-link to="/dashboard/asset-manage" class="btn-primary">
        <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor">
          <path stroke-width="2" stroke-linecap="round" d="M10 4v12M4 10h12" />
        </svg>
        Record a trade
      </router-link>
    </div>

    <!-- First load -->
    <div v-if="isFirstLoad" aria-busy="true" aria-label="Loading your portfolio">
      <div class="panel p-6">
        <Skeleton width="8rem" height="0.875rem" rounded="sm" />
        <Skeleton width="14rem" height="2.75rem" rounded="md" class="mt-3" />
        <Skeleton width="100%" height="16rem" rounded="md" class="mt-6" />
      </div>
      <div class="panel mt-5 p-6">
        <Skeleton v-for="i in 4" :key="i" width="100%" height="2.5rem" rounded="md" class="mb-3" />
      </div>
    </div>

    <div
      v-else-if="error"
      class="border-danger-500/30 bg-danger-600/10 rounded-xl border p-6 text-center"
      role="alert"
    >
      <p class="text-sm text-white">{{ error }}</p>
      <button class="btn-quiet mt-4" @click="store.load()">Try again</button>
    </div>

    <!-- Nothing held and nothing ever sold -->
    <div
      v-else-if="totals && !holdings.length && totals.realizedPnl === 0"
      class="panel border-dashed p-10 text-center"
    >
      <h2 class="text-base font-semibold text-white">No holdings yet</h2>
      <p class="text-dark-300 mx-auto mt-1 max-w-sm text-sm">
        Record your first buy to see what your portfolio is worth and how it has performed.
      </p>
      <router-link to="/dashboard/asset-manage" class="btn-primary mt-6">
        Record your first trade
      </router-link>
    </div>

    <template v-else-if="totals">
      <p
        v-if="unpriced.length"
        class="mb-5 rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
        role="status"
      >
        No live price for {{ unpriced.join(', ') }} right now, so
        {{ unpriced.length === 1 ? 'it is' : 'they are' }} left out of the totals below.
      </p>

      <div class="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <!-- Value over time: the page's one headline -->
        <section class="panel min-w-0 p-5 sm:p-6 lg:col-span-2" aria-labelledby="value-heading">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 id="value-heading" class="text-dark-300 text-sm font-medium">Total value</h2>
              <p
                class="mt-1 text-4xl font-semibold tracking-tight text-white sm:text-5xl"
                data-testid="total-value"
              >
                {{ formatCurrency(totals.value) }}
              </p>
              <p class="mt-2 text-sm">
                <Change :amount="totals.change24h" :percent="totals.change24hPercent" />
                <span class="text-dark-400 ml-1.5">past 24 hours</span>
              </p>
            </div>
            <div class="flex gap-1 rounded-lg bg-white/5 p-1" role="group" aria-label="Chart range">
              <button
                v-for="option in ranges"
                :key="option.value"
                type="button"
                :aria-pressed="range === option.value"
                class="rounded-md px-3 py-1 text-xs font-semibold transition-colors"
                :class="
                  range === option.value
                    ? 'bg-white/10 text-white'
                    : 'text-dark-300 hover:text-white'
                "
                @click="store.setRange(option.value)"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <div
            class="mt-5 transition-opacity"
            :class="isLoadingHistory ? 'opacity-50' : ''"
            :aria-busy="isLoadingHistory"
          >
            <ValueChart v-if="history.length > 1" :points="history" />
            <p v-else class="text-dark-400 flex h-40 items-center justify-center text-sm">
              {{
                isLoadingHistory ? 'Loading history…' : 'Price history is unavailable right now.'
              }}
            </p>
          </div>
        </section>

        <div class="flex min-w-0 flex-col gap-5">
          <section class="panel grid grid-cols-2 gap-x-4 gap-y-5 p-5 sm:p-6">
            <div class="col-span-2">
              <h2 class="text-dark-300 text-sm font-medium">Unrealised profit</h2>
              <p class="mt-1 text-xl font-semibold">
                <Change :amount="totals.unrealizedPnl" :percent="totals.unrealizedPnlPercent" />
              </p>
            </div>
            <div>
              <h2 class="text-dark-300 text-sm font-medium">Realised profit</h2>
              <p class="mt-1 text-base font-semibold"><Change :amount="totals.realizedPnl" /></p>
            </div>
            <div>
              <h2 class="text-dark-300 text-sm font-medium">Cost basis</h2>
              <p class="num mt-1 text-base font-semibold text-white">
                {{ formatCurrency(totals.costBasis) }}
              </p>
            </div>
          </section>

          <section class="panel flex-1 p-5 sm:p-6" aria-labelledby="allocation-heading">
            <h2 id="allocation-heading" class="text-dark-300 mb-4 text-sm font-medium">
              Allocation
            </h2>
            <AllocationDonut v-if="totals.value > 0" :holdings="holdings" />
            <p v-else class="text-dark-400 text-sm">Nothing to show yet.</p>
          </section>
        </div>
      </div>

      <!-- Holdings -->
      <section class="panel mt-5 overflow-hidden" aria-labelledby="holdings-heading">
        <h2 id="holdings-heading" class="px-5 pt-5 text-sm font-medium text-white sm:px-6">
          Holdings
        </h2>
        <p v-if="!holdings.length" class="text-dark-400 px-5 py-6 text-sm sm:px-6">
          You have sold everything. Your realised profit is shown above.
        </p>
        <div v-else class="mt-3 overflow-x-auto">
          <table class="w-full min-w-[40rem] text-sm">
            <thead>
              <tr class="text-dark-400 border-b border-white/5 text-xs">
                <th scope="col" class="px-5 py-2 text-left font-medium sm:px-6">Asset</th>
                <th scope="col" class="px-3 py-2 text-right font-medium">Price</th>
                <th scope="col" class="px-3 py-2 text-right font-medium">Holding</th>
                <th scope="col" class="px-3 py-2 text-right font-medium">Avg. cost</th>
                <th scope="col" class="px-3 py-2 text-right font-medium">Value</th>
                <th scope="col" class="px-3 py-2 text-right font-medium">Profit</th>
                <th scope="col" class="px-5 py-2 sm:px-6"><span class="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr
                v-for="holding in holdings"
                :key="holding.asset.id"
                class="hover:bg-white/[0.02]"
                data-testid="holding"
              >
                <th scope="row" class="px-5 py-3 text-left font-normal sm:px-6">
                  <span class="font-semibold text-white">{{ holding.asset.ticker }}</span>
                  <span class="text-dark-400 block text-xs">{{ holding.asset.name }}</span>
                </th>
                <td class="px-3 py-3 text-right">
                  <span class="num text-white">{{
                    holding.price === null ? '-' : formatCurrency(holding.price)
                  }}</span>
                  <span v-if="holding.change24h !== null" class="block text-xs">
                    <Change :percent="holding.change24h" />
                  </span>
                </td>
                <td class="num px-3 py-3 text-right text-white">
                  {{ formatQuantity(holding.quantity) }}
                </td>
                <td class="num text-dark-200 px-3 py-3 text-right">
                  {{ formatCurrency(holding.averageCost) }}
                </td>
                <td class="num px-3 py-3 text-right font-medium text-white">
                  {{ holding.value === null ? '-' : formatCurrency(holding.value) }}
                </td>
                <td class="px-3 py-3 text-right">
                  <template v-if="holding.unrealizedPnl !== null">
                    <Change :amount="holding.unrealizedPnl" />
                    <span class="block text-xs">
                      <Change :percent="holding.unrealizedPnlPercent" />
                    </span>
                  </template>
                  <span v-else class="text-dark-400">-</span>
                </td>
                <td class="whitespace-nowrap px-5 py-3 text-right sm:px-6">
                  <router-link
                    :to="{
                      name: 'AssetManage',
                      query: { ticker: holding.asset.ticker, action: 'buy' },
                    }"
                    class="text-primary-400 hover:text-primary-300 font-medium"
                    :aria-label="`Buy ${holding.asset.ticker}`"
                    >Buy</router-link
                  >
                  <router-link
                    :to="{
                      name: 'AssetManage',
                      query: { ticker: holding.asset.ticker, action: 'sell' },
                    }"
                    class="text-dark-200 ml-3 font-medium hover:text-white"
                    :aria-label="`Sell ${holding.asset.ticker}`"
                    >Sell</router-link
                  >
                  <button
                    type="button"
                    class="text-dark-400 hover:text-danger-400 ml-3"
                    :aria-label="`Remove ${holding.asset.ticker}`"
                    @click="((removeError = ''), (removing = holding))"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>

    <ConfirmDialog
      v-if="removing"
      :title="`Remove ${removing.asset.name}?`"
      confirm-label="Remove asset"
      :error="removeError"
      :is-working="isRemoving"
      @confirm="confirmRemove"
      @close="removing = null"
    >
      This deletes {{ removing.asset.ticker }} and every {{ removing.asset.ticker }} transaction
      from your history, as if you had never traded it. To record selling it instead, use Sell.
    </ConfirmDialog>
  </div>
</template>
