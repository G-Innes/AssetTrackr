<script setup lang="ts">
import { ref } from 'vue';

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

const userId = ref('');
const assetId = ref('');
const quantity = ref('');
const name = ref('');
const ticker = ref('');
const currentPrice = ref('');

const handleSubmit = () => {
  const payload = {
    userId: Number(userId.value),
    assetId: Number(assetId.value),
    quantity: Number(quantity.value),
    name: name.value,
    ticker: ticker.value,
    current_price: Number(currentPrice.value)
  };
  // Emit the payload to the parent component
  emit('submit', payload);
};
</script>

<template>
    <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 class="mt-6 text-3xl font-extrabold text-center text-gray-900">Create Asset</h2>
        <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
          <div>
            <label for="userId" class="block text-sm font-medium text-gray-700">User ID</label>
            <div class="mt-1">
              <input v-model="userId" type="number" id="userId" name="userId" autocomplete="userId" required
                class="block w-full px-3 py-2 mt-1 text-gray-900 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
            </div>
          </div>
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
              <input v-model="quantity" type="number" id="quantity" name="quantity" autocomplete="quantity" required
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
            <div class="mt-1">
              <input v-model="ticker" type="text" id="ticker" name="ticker" autocomplete="ticker" required
                class="block w-full px-3 py-2 mt-1 text-gray-900 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
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
          <div>
            <button type="submit"
              class="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Create Asset
            </button>
          </div>
        </form>
      </div>
    </div>
  </template>
