<script lang="ts">
import { defineComponent, type PropType } from 'vue';

export interface Asset {
    assetId: number,
    name: string;
    ticker: string;
    quantity: number;
    current_price: number;
}

export default defineComponent({
  name: 'AssetCard',
  props: {
    asset: {
      type: Object as PropType<Asset>,
      required: true,
    },
  },
});
</script>

<template>
    <div class="max-w-sm rounded overflow-hidden shadow-lg p-4 bg-white">
      <div class="font-bold text-xl mb-2">{{ asset.name }}</div>
      <p class="text-gray-700 text-base">
        Ticker: {{ asset.ticker }}
      </p>
      <p class="text-gray-700 text-base">
        Quantity: {{ asset.quantity }}
      </p>
      <p class="text-gray-700 text-base">
        Current Price: ${{ asset.current_price }}
      </p>
    </div>
  </template>