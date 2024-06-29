<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import TransactionCard from '../components/TransactionCard.vue'
import { getAllTransactionsForUser, getTransactionsByType } from '@/services/apiService'
import type { Transaction } from '../components/TransactionCard.vue'

const transactions = ref<Transaction[]>([])
//const assetId = ref('')

onMounted(async () => {
  try {
    transactions.value = await getAllTransactionsForUser()
  } catch (error) {
    console.error('Error fetching transactions:', error)
  }
})

const fetchAllTransactions = async () => {
  try {
    transactions.value = await getAllTransactionsForUser()
  } catch (error) {
    console.error('Error fetching all transactions:', error)
  }
}

const fetchTransactionsByType = async (type: string) => {
  try {
    transactions.value = await getTransactionsByType(type)
  } catch (error) {
    console.error('Error fetching transactions by type:', error)
  }
}
</script>

<template>
  <div class="TransactionsView p-4">
    <div class="mb-16 flex flex-wrap justify-between gap-6">
      <button
        type="button"
        @click="fetchAllTransactions"
        class="memphis-button all flex w-60 justify-center rounded-md border border-transparent px-4 py-2 shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      >
        All Transactions
      </button>
      <button
        type="button"
        @click="fetchTransactionsByType('buy')"
        class="memphis-button buy flex w-60 justify-center rounded-md border border-transparent px-4 py-2 shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      >
        Buy Transactions
      </button>
      <button
        type="button"
        @click="fetchTransactionsByType('sell')"
        class="memphis-button sell w-60 justify-center rounded-md border border-transparent px-4 py-2 shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      >
        Sell Transactions
      </button>
    </div>

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

<style scoped>
.all {
  background-color: #65bfec;
}
.sell {
  background-color: #ffb2a5;
}
.buy {
  background-color: #b2f7b1;
}
.memphis-button {
  color: #121212;
  box-shadow: 10px 10px 0 #121212;
  border-radius: 10px;
  transition: transform 0.2s;
  display: flex;
  flex-direction: column;
  padding: 2rem;
}
.memphis-button:hover {
  transform: translate(-5px, -5px);
}
</style>
