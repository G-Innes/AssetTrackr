<script lang="ts" setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import TradeForm from '@/components/TradeForm.vue'
import { api, getErrorMessage } from '@/services/api'
import { formatCurrency, formatDate, formatQuantity } from '@/utils/format'
import type { NewTransaction, Transaction, TransactionType } from '@/types'

const route = useRoute()

const form = ref<InstanceType<typeof TradeForm> | null>(null)
const initialTicker = typeof route.query.ticker === 'string' ? route.query.ticker : undefined
const initialType: TransactionType = route.query.action === 'sell' ? 'sell' : 'buy'

const isSubmitting = ref(false)
const errorMessage = ref('')
const recorded = ref<Transaction[]>([])

async function handleSubmit(payload: NewTransaction) {
  isSubmitting.value = true
  errorMessage.value = ''
  try {
    recorded.value.unshift(await api.createTransaction(payload))
    form.value?.reset()
  } catch (error) {
    errorMessage.value = getErrorMessage(error, 'Could not record the trade. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-xl">
    <div class="mb-6">
      <h1 class="font-display text-2xl font-bold text-white">Record a trade</h1>
      <p class="text-dark-300 mt-1 text-sm">
        Log a buy or sell you made. Backdate it and the price is filled in from that day's market.
      </p>
    </div>

    <div class="panel p-5 sm:p-6">
      <p
        v-if="errorMessage"
        role="alert"
        class="border-danger-500/30 bg-danger-600/10 text-danger-200 mb-5 rounded-md border px-3 py-2 text-sm"
      >
        {{ errorMessage }}
      </p>
      <TradeForm
        ref="form"
        :initial-ticker="initialTicker"
        :initial-type="initialType"
        :is-submitting="isSubmitting"
        @submit="handleSubmit"
      />
    </div>

    <div v-if="recorded.length" class="mt-6">
      <h2 class="text-dark-300 mb-2 text-sm font-medium">Just recorded</h2>
      <ul class="panel divide-y divide-white/5">
        <li
          v-for="(transaction, index) in recorded"
          :key="transaction.id"
          :role="index === 0 ? 'status' : undefined"
          class="flex items-center justify-between gap-3 px-4 py-3 text-sm"
        >
          <span class="text-white">
            {{ transaction.type === 'buy' ? 'Bought' : 'Sold' }}
            {{ formatQuantity(transaction.quantity) }} {{ transaction.asset.ticker }}
          </span>
          <span class="text-dark-300 num">
            {{ formatCurrency(Number(transaction.quantity) * Number(transaction.price)) }}
            · {{ formatDate(transaction.executedAt) }}
          </span>
        </li>
      </ul>
      <div class="mt-4 flex gap-4 text-sm">
        <router-link to="/dashboard" class="text-primary-400 hover:text-primary-300">
          View portfolio
        </router-link>
        <router-link to="/dashboard/transactions" class="text-primary-400 hover:text-primary-300">
          All transactions
        </router-link>
      </div>
    </div>
  </div>
</template>
