<script lang="ts">
import { defineComponent, type PropType } from 'vue'

export interface Asset {
  id: number
  name: string
  ticker: string
  current_price: number
}
export interface Transaction {
  id: number
  transactionType: string
  quantity: number
  price: string | number
  transaction_date: string
  assetId: number
  assetTicker: string
}

export default defineComponent({
  name: 'TransactionCard',
  props: {
    transaction: {
      type: Object as PropType<Transaction>,
      required: true,
    },
  },
  computed: {
    formattedPrice(): string {
      return typeof this.transaction.price === 'number'
        ? this.transaction.price.toFixed(2)
        : this.transaction.price
    },
    cardColor(): string {
      switch (this.transaction.transactionType.toLowerCase()) {
        case 'buy':
          return '#B2F7B1' // Light green for buy
        case 'sell':
          return '#FFB2A5' // Light red for sell
        default:
          return '#CCCCCC' // Default color
      }
    },
  },
})
</script>

<template>
  <div :style="{ backgroundColor: cardColor }" class="memphis-card">
    <div class="mb-2 text-xl font-bold">
      {{ transaction.transactionType.toLocaleUpperCase() }} {{ transaction.assetTicker }}
    </div>
    <p class="text text-base">Quantity: {{ transaction.quantity }}</p>
    <p class="text text-base">Price: ${{ formattedPrice }}</p>
    <p class="text text-base">Date: {{ transaction.transaction_date }}</p>
  </div>
</template>

<style scoped>
.memphis-card {
  background-color: #cccccc;
  color: #121212;
  box-shadow: 10px 10px 0 #121212;
  border-radius: 10px;
  transition: transform 0.2s;
  display: flex;
  flex-direction: column;
  padding: 2rem;
}
.text {
  color: #121212;
}
</style>
