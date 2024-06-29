<script lang="ts">
import { defineComponent, type PropType } from 'vue'

export interface Asset {
  assetId: number
  name: string
  ticker: string
  quantity: number
  current_price: number | null
  total_value: number | null
}

export default defineComponent({
  name: 'AssetCard',
  props: {
    asset: {
      type: Object as PropType<Asset>,
      required: true,
    },
    cardColor: {
      type: String as PropType<string>,
      required: true,
    },
  },
  computed: {
    formattedTotalValue(): string {
      if (this.asset.total_value !== null) {
        return this.asset.total_value.toFixed(2)
      }
      return 'N/A'
    },
  },
})
</script>

<template>
  <div :style="{ backgroundColor: cardColor }" class="memphis-card">
    <div class="mb-2 text-xl font-bold">{{ asset.name }}</div>
    <p class="text text-base">Ticker: {{ asset.ticker }}</p>
    <p class="text text-base">Quantity: {{ asset.quantity }}</p>
    <p class="text text-base">Current Price: ${{ asset.current_price }}</p>
    <p class="text text-base">Value: ${{ formattedTotalValue }}</p>
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
