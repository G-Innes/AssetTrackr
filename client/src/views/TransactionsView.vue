<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import TransactionCard from '../components/TransactionCard.vue'
import { getAllTransactionsForUser } from '@/services/apiService'
import type { Transaction } from '../components/TransactionCard.vue'

const transactions = ref<Transaction[]>([])

onMounted(async () => {
  try {
    transactions.value = await getAllTransactionsForUser()
  } catch (error) {
    console.error('Error fetching transactions:', error)
  }
})
</script>

<template>
  <div class="TransactionsView p-4">
    <div v-if="transactions.length === 0">
      <p>No transactions yet!</p>
    </div>
    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <TransactionCard
        v-for="transaction in transactions"
        :key="transaction.id"
        :transaction="transaction"
        :card-color="'#FFD1BA'"
      />
    </div>
  </div>
</template>

<style scoped></style>
