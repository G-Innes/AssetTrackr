<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import TradeForm from '@/components/TradeForm.vue'
import { ConfirmDialog, Modal, Skeleton } from '@/components/ui'
import { api, getErrorMessage } from '@/services/api'
import { formatCurrency, formatDate, formatQuantity } from '@/utils/format'
import type { NewTransaction, Transaction } from '@/types'

type Filter = 'all' | 'buy' | 'sell'
const filters: Filter[] = ['all', 'buy', 'sell']

const transactions = ref<Transaction[]>([])
const isLoading = ref(true)
const error = ref('')
const activeFilter = ref<Filter>('all')

async function loadTransactions() {
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

const totalOf = (transaction: Transaction) =>
  Number(transaction.quantity) * Number(transaction.price)

// ---- edit
const editing = ref<Transaction | null>(null)
const editError = ref('')
const isSaving = ref(false)

function startEdit(transaction: Transaction) {
  editError.value = ''
  editing.value = transaction
}

async function saveEdit(payload: NewTransaction) {
  if (!editing.value) return
  isSaving.value = true
  editError.value = ''
  try {
    // The asset of a recorded trade cannot change, so the ticker is not sent.
    await api.updateTransaction(editing.value.id, {
      type: payload.type,
      quantity: payload.quantity,
      price: payload.price,
      executedAt: payload.executedAt,
      note: payload.note,
    })
    editing.value = null
    // Reload rather than patch in place: a new date can change the order.
    await loadTransactions()
  } catch (failure) {
    editError.value = getErrorMessage(failure, 'Could not save the changes. Please try again.')
  } finally {
    isSaving.value = false
  }
}

// ---- delete
const deleting = ref<Transaction | null>(null)
const deleteError = ref('')
const isDeleting = ref(false)

function startDelete(transaction: Transaction) {
  deleteError.value = ''
  deleting.value = transaction
}

async function confirmDelete() {
  if (!deleting.value) return
  isDeleting.value = true
  deleteError.value = ''
  try {
    const { id } = deleting.value
    await api.deleteTransaction(id)
    transactions.value = transactions.value.filter((transaction) => transaction.id !== id)
    deleting.value = null
  } catch (failure) {
    deleteError.value = getErrorMessage(failure, 'Could not delete it. Please try again.')
  } finally {
    isDeleting.value = false
  }
}

onMounted(loadTransactions)
</script>

<template>
  <div class="mx-auto max-w-6xl">
    <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
      <h1 class="font-display text-2xl font-bold text-white">Transactions</h1>
      <div class="flex gap-1 rounded-lg bg-white/5 p-1" role="group" aria-label="Filter by type">
        <button
          v-for="filter in filters"
          :key="filter"
          type="button"
          :aria-pressed="activeFilter === filter"
          class="rounded-md px-3 py-1 text-xs font-semibold capitalize transition-colors"
          :class="
            activeFilter === filter ? 'bg-white/10 text-white' : 'text-dark-300 hover:text-white'
          "
          @click="activeFilter = filter"
        >
          {{ filter }}
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="panel p-5" aria-busy="true" aria-label="Loading transactions">
      <Skeleton v-for="i in 6" :key="i" width="100%" height="2.25rem" rounded="md" class="mb-3" />
    </div>

    <div v-else-if="error" class="notice-error p-6 text-center" role="alert">
      <p class="text-sm text-white">{{ error }}</p>
      <button class="btn-quiet mt-4" @click="loadTransactions">Try again</button>
    </div>

    <div v-else-if="!transactions.length" class="panel border-dashed p-10 text-center">
      <h2 class="text-base font-semibold text-white">No transactions yet</h2>
      <p class="text-dark-300 mt-1 text-sm">Every buy and sell you record is listed here.</p>
      <router-link to="/dashboard/asset-manage" class="btn-primary mt-6"
        >Record a trade</router-link
      >
    </div>

    <p v-else-if="!filteredTransactions.length" class="panel text-dark-300 p-8 text-center text-sm">
      No {{ activeFilter }} transactions.
    </p>

    <div v-else class="panel relative overflow-x-auto">
      <table class="w-full min-w-[44rem] text-sm">
        <thead>
          <tr class="text-dark-400 border-b border-white/5 text-xs">
            <th scope="col" class="px-5 py-3 text-left font-medium">Date</th>
            <th scope="col" class="px-3 py-3 text-left font-medium">Type</th>
            <th scope="col" class="px-3 py-3 text-left font-medium">Asset</th>
            <th scope="col" class="px-3 py-3 text-right font-medium">Quantity</th>
            <th scope="col" class="px-3 py-3 text-right font-medium">Price</th>
            <th scope="col" class="px-3 py-3 text-right font-medium">Total</th>
            <th scope="col" class="px-3 py-3 text-left font-medium">Note</th>
            <th scope="col" class="px-5 py-3"><span class="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/5">
          <tr
            v-for="transaction in filteredTransactions"
            :key="transaction.id"
            class="hover:bg-white/[0.02]"
          >
            <td class="text-dark-200 whitespace-nowrap px-5 py-3">
              {{ formatDate(transaction.executedAt) }}
            </td>
            <td class="px-3 py-3">
              <span
                class="inline-block rounded px-1.5 py-0.5 text-xs font-semibold capitalize"
                :class="
                  transaction.type === 'buy'
                    ? 'bg-success-500/15 text-success-300'
                    : 'bg-danger-500/15 text-danger-300'
                "
              >
                {{ transaction.type }}
              </span>
            </td>
            <td class="px-3 py-3">
              <span class="font-semibold text-white">{{ transaction.asset.ticker }}</span>
              <span class="text-dark-400 ml-1.5 hidden text-xs lg:inline">{{
                transaction.asset.name
              }}</span>
            </td>
            <td class="num px-3 py-3 text-right text-white">
              {{ formatQuantity(transaction.quantity) }}
            </td>
            <td class="num text-dark-200 px-3 py-3 text-right">
              {{ formatCurrency(transaction.price) }}
            </td>
            <td class="num px-3 py-3 text-right font-medium text-white">
              {{ formatCurrency(totalOf(transaction)) }}
            </td>
            <td
              class="text-dark-300 max-w-[14rem] truncate px-3 py-3"
              :title="transaction.note ?? ''"
            >
              {{ transaction.note }}
            </td>
            <td class="whitespace-nowrap px-5 py-3 text-right">
              <button
                type="button"
                class="text-primary-400 hover:text-primary-300 font-medium"
                :aria-label="`Edit ${transaction.type} of ${transaction.asset.ticker}`"
                @click="startEdit(transaction)"
              >
                Edit
              </button>
              <button
                type="button"
                class="text-dark-400 hover:text-danger-400 ml-3"
                :aria-label="`Delete ${transaction.type} of ${transaction.asset.ticker}`"
                @click="startDelete(transaction)"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Modal v-if="editing" title="Edit transaction" @close="editing = null">
      <p v-if="editError" role="alert" class="notice-error mb-4">
        {{ editError }}
      </p>
      <TradeForm
        :transaction="editing"
        :is-submitting="isSaving"
        @submit="saveEdit"
        @cancel="editing = null"
      />
    </Modal>

    <ConfirmDialog
      v-if="deleting"
      title="Delete this transaction?"
      confirm-label="Delete"
      :error="deleteError"
      :is-working="isDeleting"
      @confirm="confirmDelete"
      @close="deleting = null"
    >
      {{ deleting.type === 'buy' ? 'Buy' : 'Sell' }} of {{ formatQuantity(deleting.quantity) }}
      {{ deleting.asset.ticker }} on {{ formatDate(deleting.executedAt) }}. Your holdings and profit
      figures will be recalculated without it.
    </ConfirmDialog>
  </div>
</template>
