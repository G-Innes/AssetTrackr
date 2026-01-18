<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getAllTransactionsForUser, getTransactionsByType } from '@/services/apiService'
import type { Transaction } from '../components/TransactionCard.vue'
import { Skeleton } from '@/components/ui'

const router = useRouter()
const transactions = ref<Transaction[]>([])
const isLoading = ref(true)
const activeFilter = ref('all')

onMounted(async () => {
  try {
    transactions.value = await getAllTransactionsForUser()
  } catch (error) {
    console.error('Error fetching transactions:', error)
  } finally {
    isLoading.value = false
  }
})

const fetchAllTransactions = async () => {
  isLoading.value = true
  try {
    transactions.value = await getAllTransactionsForUser()
    activeFilter.value = 'all'
  } catch (error) {
    console.error('Error fetching all transactions:', error)
  } finally {
    isLoading.value = false
  }
}

const fetchTransactionsByType = async (type: string) => {
  isLoading.value = true
  try {
    // Convert type to lowercase for consistency
    const normalizedType = type.toLowerCase()
    transactions.value = await getTransactionsByType(normalizedType)
    activeFilter.value = normalizedType
  } catch (error) {
    console.error('Error fetching transactions by type:', error)
    // Fallback to all transactions on error
    await fetchAllTransactions()
  } finally {
    isLoading.value = false
  }
}

// Filter transactions
const filteredTransactions = computed(() => {
  if (activeFilter.value === 'all') {
    return transactions.value
  }
  // Make sure to match the case sensitivity on transaction_type
  return transactions.value.filter(
    (t) =>
      t.transaction_type?.toLowerCase() === activeFilter.value ||
      t.transactionType?.toLowerCase() === activeFilter.value
  )
})

// Format date
function formatDate(dateString) {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid Date'
  }
}

// Format currency
function formatCurrency(value) {
  if (value === undefined || value === null) return '$0.00'
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  } catch (error) {
    console.error('Error formatting currency:', error)
    return '$0.00'
  }
}

// Go to transaction details
function viewDetails(transaction) {
  const ticker = transaction.asset_ticker || transaction.assetTicker
  if (!ticker) {
    console.error('Cannot view details - missing ticker', transaction)
    return
  }

  router.push({
    name: 'AssetManage',
    query: { ticker },
  })
}
</script>

<template>
  <div class="TransactionsView p-4">
    <div class="mb-8">
      <h1 class="font-display text-3xl font-bold text-white">Transactions</h1>
      <p class="mt-2 text-dark-300">View your transaction history</p>
    </div>

    <!-- Filter tabs -->
    <div class="mb-6 border-b border-white/10">
      <nav class="-mb-px flex space-x-8" aria-label="Tabs">
        <button
          v-for="filter in ['all', 'buy', 'sell']"
          :key="filter"
          @click="filter === 'all' ? fetchAllTransactions() : fetchTransactionsByType(filter)"
          :class="[
            activeFilter === filter
              ? 'border-primary-500 text-primary-400'
              : 'border-transparent text-dark-300 hover:border-white/20 hover:text-dark-200',
            'whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium capitalize transition-colors',
          ]"
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

    <!-- Empty state -->
    <div
      v-else-if="filteredTransactions.length === 0"
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
      <h3 class="mt-2 text-sm font-medium text-white">No transactions found</h3>
      <p class="mt-1 text-sm text-dark-400">
        {{
          activeFilter === 'all'
            ? 'Get started by adding your first transaction.'
            : `No ${activeFilter} transactions found.`
        }}
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
                class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-dark-300 sm:pl-6"
              >
                Date
              </th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-dark-300">
                Asset
              </th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-dark-300">
                Type
              </th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-dark-300">
                Quantity
              </th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-dark-300">
                Price
              </th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-dark-300">
                Total
              </th>
              <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span class="sr-only">View</span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/10">
            <tr
              v-for="(transaction, index) in filteredTransactions"
              :key="transaction.id"
              v-motion
              :initial="{ opacity: 0, x: -20 }"
              :enter="{ opacity: 1, x: 0, transition: { duration: 300, delay: index * 50 } }"
              class="transition-colors duration-200 hover:bg-white/5"
            >
              <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-dark-200 sm:pl-6">
                {{ formatDate(transaction.transaction_date || transaction.transactionDate) }}
              </td>
              <td class="whitespace-nowrap px-3 py-4">
                <div class="flex items-center">
                  <div
                    class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-500/20 text-primary-400 ring-1 ring-primary-500/30"
                  >
                    {{
                      (transaction.asset_ticker || transaction.assetTicker || 'N/A').substring(0, 3)
                    }}
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-white">
                      {{ transaction.asset_name || transaction.assetName || 'Unknown Asset' }}
                    </div>
                    <div class="text-sm text-dark-300">
                      {{ transaction.asset_ticker || transaction.assetTicker || 'N/A' }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm">
                <span
                  :class="[
                    (
                      transaction.transaction_type ||
                      transaction.transactionType ||
                      ''
                    ).toLowerCase() === 'buy'
                      ? 'bg-success-900/30 text-success-400 ring-1 ring-success-700/30'
                      : 'bg-danger-900/30 text-danger-400 ring-1 ring-danger-700/30',
                    'inline-flex rounded-full px-2 py-1 text-xs font-semibold leading-5',
                  ]"
                >
                  {{ transaction.transaction_type || transaction.transactionType || 'Unknown' }}
                </span>
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-dark-200">
                {{ transaction.quantity || 0 }}
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-dark-200">
                {{ formatCurrency(transaction.price) }}
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm font-medium text-white">
                {{ formatCurrency((transaction.quantity || 0) * (transaction.price || 0)) }}
              </td>
              <td
                class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"
              >
                <button
                  @click="viewDetails(transaction)"
                  class="text-primary-400 hover:text-primary-300"
                >
                  View<span class="sr-only"
                    >,
                    {{ transaction.asset_name || transaction.assetName || 'Unknown Asset' }}</span
                  >
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
