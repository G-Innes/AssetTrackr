<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/services/api'
import { Skeleton } from '@/components/ui'
import { formatCurrency, formatDate, formatQuantity } from '@/utils/format'
import type { Transaction } from '@/types'

type Filter = 'all' | 'buy' | 'sell'
const filters: Filter[] = ['all', 'buy', 'sell']

const router = useRouter()
const transactions = ref<Transaction[]>([])
const isLoading = ref(true)
const error = ref('')
const activeFilter = ref<Filter>('all')

async function loadTransactions() {
  isLoading.value = true
  error.value = ''
  try {
    transactions.value = await api.getTransactions()
  } catch {
    error.value = 'Could not load your transactions. Please try again.'
  } finally {
    isLoading.value = false
  }
}

// The whole history is already loaded, so the tabs filter it in place.
const filteredTransactions = computed(() =>
  activeFilter.value === 'all'
    ? transactions.value
    : transactions.value.filter((transaction) => transaction.type === activeFilter.value)
)

function viewDetails(transaction: Transaction) {
  router.push({ name: 'AssetManage', query: { ticker: transaction.asset.ticker } })
}

onMounted(loadTransactions)
</script>

<template>
  <div class="TransactionsView p-4">
    <div class="mb-8">
      <h1 class="font-display text-3xl font-bold text-white">Transactions</h1>
      <p class="text-dark-300 mt-2">View your transaction history</p>
    </div>

    <!-- Filter tabs -->
    <div class="mb-6 border-b border-white/10">
      <nav class="-mb-px flex space-x-8" aria-label="Tabs">
        <button
          v-for="filter in filters"
          :key="filter"
          :aria-pressed="activeFilter === filter"
          :class="[
            activeFilter === filter
              ? 'border-primary-500 text-primary-400'
              : 'text-dark-300 hover:text-dark-200 border-transparent hover:border-white/20',
            'whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium capitalize transition-colors',
          ]"
          @click="activeFilter = filter"
        >
          {{ filter }}
        </button>
      </nav>
    </div>

    <!-- Loading state with skeleton table -->
    <div
      v-if="isLoading"
      class="glass-card shadow-glow-white overflow-hidden rounded-xl border border-white/10"
    >
      <div class="relative overflow-x-auto">
        <table class="w-full divide-y divide-white/10">
          <thead>
            <tr>
              <th class="py-3.5 pl-4 pr-3 text-left sm:pl-6">
                <Skeleton width="3rem" height="0.875rem" rounded="sm" />
              </th>
              <th class="px-3 py-3.5 text-left">
                <Skeleton width="3rem" height="0.875rem" rounded="sm" />
              </th>
              <th class="px-3 py-3.5 text-left">
                <Skeleton width="2.5rem" height="0.875rem" rounded="sm" />
              </th>
              <th class="px-3 py-3.5 text-left">
                <Skeleton width="4rem" height="0.875rem" rounded="sm" />
              </th>
              <th class="px-3 py-3.5 text-left">
                <Skeleton width="3rem" height="0.875rem" rounded="sm" />
              </th>
              <th class="px-3 py-3.5 text-left">
                <Skeleton width="3rem" height="0.875rem" rounded="sm" />
              </th>
              <th class="relative py-3.5 pl-3 pr-4 sm:pr-6"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/10">
            <tr v-for="i in 8" :key="i">
              <td class="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                <Skeleton width="5rem" height="1rem" rounded="sm" />
              </td>
              <td class="whitespace-nowrap px-3 py-4">
                <div class="flex items-center">
                  <Skeleton width="2rem" height="2rem" rounded="full" />
                  <div class="ml-4">
                    <Skeleton width="5rem" height="0.875rem" rounded="sm" />
                    <Skeleton width="3rem" height="0.75rem" rounded="sm" class="mt-1" />
                  </div>
                </div>
              </td>
              <td class="whitespace-nowrap px-3 py-4">
                <Skeleton width="3rem" height="1.5rem" rounded="full" />
              </td>
              <td class="whitespace-nowrap px-3 py-4">
                <Skeleton width="2.5rem" height="1rem" rounded="sm" />
              </td>
              <td class="whitespace-nowrap px-3 py-4">
                <Skeleton width="4rem" height="1rem" rounded="sm" />
              </td>
              <td class="whitespace-nowrap px-3 py-4">
                <Skeleton width="4.5rem" height="1rem" rounded="sm" />
              </td>
              <td class="whitespace-nowrap py-4 pl-3 pr-4 sm:pr-6">
                <Skeleton width="2.5rem" height="1rem" rounded="sm" class="ml-auto" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Error state -->
    <div
      v-else-if="error"
      class="border-danger-500/30 bg-danger-600/10 rounded-xl border p-6 text-center"
      role="alert"
    >
      <p class="text-sm text-white">{{ error }}</p>
      <button
        class="mt-4 rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20"
        @click="loadTransactions"
      >
        Try again
      </button>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="filteredTransactions.length === 0"
      class="glass-card shadow-glow-white rounded-xl border border-dashed border-white/20 p-8 text-center"
    >
      <div class="text-dark-400 mx-auto h-12 w-12">
        <svg class="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      </div>
      <h3 class="mt-2 text-sm font-medium text-white">No transactions found</h3>
      <p class="text-dark-400 mt-1 text-sm">
        {{
          activeFilter === 'all'
            ? 'Get started by adding your first transaction.'
            : `No ${activeFilter} transactions found.`
        }}
      </p>
      <div class="mt-6">
        <router-link
          to="/dashboard/asset-manage"
          class="shadow-glow-primary bg-primary-600 hover:bg-primary-500 focus-visible:outline-primary-600 inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <svg class="-ml-0.5 mr-1.5 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Transaction
        </router-link>
      </div>
    </div>

    <!-- Transactions table -->
    <div
      v-else
      class="glass-card shadow-glow-white overflow-hidden rounded-xl border border-white/10"
    >
      <div class="relative overflow-x-auto">
        <table class="w-full divide-y divide-white/10">
          <thead>
            <tr>
              <th
                scope="col"
                class="text-dark-300 py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-6"
              >
                Date
              </th>
              <th scope="col" class="text-dark-300 px-3 py-3.5 text-left text-sm font-semibold">
                Asset
              </th>
              <th scope="col" class="text-dark-300 px-3 py-3.5 text-left text-sm font-semibold">
                Type
              </th>
              <th scope="col" class="text-dark-300 px-3 py-3.5 text-left text-sm font-semibold">
                Quantity
              </th>
              <th scope="col" class="text-dark-300 px-3 py-3.5 text-left text-sm font-semibold">
                Price
              </th>
              <th scope="col" class="text-dark-300 px-3 py-3.5 text-left text-sm font-semibold">
                Total
              </th>
              <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span class="sr-only">Trade</span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/10">
            <tr
              v-for="transaction in filteredTransactions"
              :key="transaction.id"
              class="transition-colors duration-200 hover:bg-white/5"
            >
              <td class="text-dark-200 whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                {{ formatDate(transaction.executedAt) }}
              </td>
              <td class="whitespace-nowrap px-3 py-4">
                <div class="flex items-center">
                  <div
                    class="bg-primary-500/20 text-primary-400 ring-primary-500/30 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs ring-1"
                  >
                    {{ transaction.asset.ticker.substring(0, 3) }}
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-white">{{ transaction.asset.name }}</div>
                    <div class="text-dark-300 text-sm">{{ transaction.asset.ticker }}</div>
                  </div>
                </div>
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm">
                <span
                  :class="[
                    transaction.type === 'buy'
                      ? 'bg-success-900/30 text-success-400 ring-success-700/30 ring-1'
                      : 'bg-danger-900/30 text-danger-400 ring-danger-700/30 ring-1',
                    'inline-flex rounded-full px-2 py-1 text-xs font-semibold capitalize leading-5',
                  ]"
                >
                  {{ transaction.type }}
                </span>
              </td>
              <td class="text-dark-200 whitespace-nowrap px-3 py-4 text-sm">
                {{ formatQuantity(transaction.quantity) }}
              </td>
              <td class="text-dark-200 whitespace-nowrap px-3 py-4 text-sm">
                {{ formatCurrency(transaction.price) }}
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm font-medium text-white">
                {{ formatCurrency(Number(transaction.quantity) * Number(transaction.price)) }}
              </td>
              <td
                class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"
              >
                <button
                  class="text-primary-400 hover:text-primary-300"
                  @click="viewDetails(transaction)"
                >
                  Trade<span class="sr-only">, {{ transaction.asset.name }}</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
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
