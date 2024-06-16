<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getCurrentUserId } from '../utils/user';
import { getLivePrice } from '@/utils/getLivePrice';
import { assets } from '../assets/assets'
import type { Asset } from '../assets/assets';


const emit = defineEmits<{
  (e: 'submit', payload: {
    userId: number,
    assetId: number,
    quantity: number,
    name: string,
    ticker: string,
    current_price: number,
  }): void;
}>();

const userId = ref<number | null>(null);
const assetId = ref<number | null>(null);
const quantity = ref<number | null>(null);
const name = ref('');
const ticker = ref('');
const currentPrice = ref<number | null>(null);
const tickers = ref<string[]>([]);


// Populate the userId using the getCurrentUserId function
onMounted( async () => {
  userId.value = getCurrentUserId();
  tickers.value = [];
});

const fetchCurrentPrice = async () => {
  if (ticker.value) {
    currentPrice.value = await getLivePrice(ticker.value) || 0;
  }
};

const handleSubmit = async (action: 'buy' | 'sell') => {
  if (!quantity.value) {
    return;
  }
  await fetchCurrentPrice();
  const finalQuantity = action === 'sell' ? -Math.abs(quantity.value) : Math.abs(quantity.value);

  const payload = {
    userId: Number(userId.value),
    assetId: Number(assetId.value),
    quantity: finalQuantity,
    name: name.value,
    ticker: ticker.value,
    current_price: Number(currentPrice.value)
  };
  // Emit the payload to the parent component
  emit('submit', payload);
};

const handleTickerInput = (event: Event) => {
  const input = (event.target as HTMLInputElement).value.toUpperCase();
  if (input) {
    tickers.value = assets
    .filter((asset: Asset) => asset.ticker.startsWith(input))
    .map((asset: Asset) => asset.ticker)
    .slice(0, 8);
  } else {
    tickers.value = [];
  }
}
// Updates the ticker variable and calculates the assetId based on the index of the ticker in the allTickers array
// Select a ticker from the filtered list
const selectTicker = async (selectedTicker: string) => {
  ticker.value = selectedTicker;
  await fetchCurrentPrice();
  // Find the asset corresponding to the selected ticker
  const selectedAsset = assets.find(asset => asset.ticker === selectedTicker);
  if (selectedAsset) {
    assetId.value = selectedAsset.assetId;
  }
  tickers.value = []; // Hide dropdown after selection
};
</script>

<template>
    <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 class="mt-6 text-3xl font-extrabold text-center text-gray-900">Create Asset</h2>
        <form class="mt-8 space-y-6" @submit.prevent>

          <!-- Hidden userId field automatically populated -->
        <input v-model="userId" type="hidden" id="userId" name="userId">

          <div>
            <label for="assetId" class="block text-sm font-medium text-gray-700">Asset ID</label>
            <div class="mt-1">
              <input v-model="assetId" type="number" id="assetId" name="assetId" autocomplete="assetId" required
                class="block w-full px-3 py-2 mt-1 text-gray-900 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
            </div>
          </div>
          <div>
            <label for="quantity" class="block text-sm font-medium text-gray-700">Quantity</label>
            <div class="mt-1">
              <input v-model="quantity" type="number" step="any" id="quantity" name="quantity" autocomplete="quantity" required
                class="block w-full px-3 py-2 mt-1 text-gray-900 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
            </div>
          </div>
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Asset Name</label>
            <div class="mt-1">
              <input v-model="name" type="text" id="name" name="name" autocomplete="name" required
                class="block w-full px-3 py-2 mt-1 text-gray-900 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
            </div>
          </div>
          <div>
            <label for="ticker" class="block text-sm font-medium text-gray-700">Ticker Symbol</label>
            <div class="mt-1" relative>
              <input v-model="ticker" @input="handleTickerInput" type="text" id="ticker" name="ticker" autocomplete="off"
              required class="block w-full px-3 py-2 mt-1 text-gray-900 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
              <ul v-if="tickers.length > 0" class="absolute z-10 w-32 max-h-32 overflow-y-auto mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
              <li v-for="(item, index) in tickers" :key="index" @click="selectTicker(item)" class="px-3 py-1 cursor-pointer hover:bg-gray-100">
                {{ item }}
              </li>
            </ul>
            </div>
          </div>
          <div>
            <label for="currentPrice" class="block text-sm font-medium text-gray-700">Current Price</label>
            <div class="mt-1">
              <input v-model="currentPrice" type="number" id="currentPrice" name="currentPrice"
                autocomplete="currentPrice" required
                class="block w-full px-3 py-2 mt-1 text-gray-900 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
            </div>
          </div>
          <div class="flex justify-between">
          <button type="button" @click="handleSubmit('buy')"
            class="flex justify-center w-full px-4 py-2 mr-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
            Buy
          </button>
          <button type="button" @click="handleSubmit('sell')"
            class="flex justify-center w-full px-4 py-2 ml-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
            Sell
          </button>
        </div>
        </form>
      </div>
    </div>
  </template>
