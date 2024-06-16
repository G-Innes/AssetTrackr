<script lang="ts" setup>

import { ref, onMounted } from 'vue';
import { FwbAlert } from 'flowbite-vue'
import AssetCard from '../components/AssetCard.vue';
import { getAllAssetHoldingsForUser } from '@/services/apiService';
import type { Asset } from '@/components/AssetCard.vue';
import { getUserProfile } from '@/services/apiService';



const assets = ref<Asset[]>([]);
const username = ref<string>('');
const totalPortfolioValue = ref<number>(0);

// Fetch assets on component mount
onMounted(async () => {
  try {
    const userProfile = await getUserProfile();
    username.value = userProfile.username;

    const userAssets: Asset[] = await getAllAssetHoldingsForUser();
    assets.value = userAssets;

    totalPortfolioValue.value = userAssets.reduce((total, asset) => {
      const currentPrice = asset.current_price ?? 0;
      return total + (asset.quantity * currentPrice);
    }, 0);
  
  } catch (error) {
    console.error('Error fetching assets:', error);
  }
});

</script>

<template>
  <div class="DashboardView p-4">

    <div class="mb-4 text-center">
      <h1 class="text-3xl font-bold">Welcome, {{ username }}</h1>
      <p class="text-xl mt-2">Your total portfolio value today is: <span class="font-semibold">${{ totalPortfolioValue.toFixed(2) }}</span></p>
    </div>

  
    <div v-if="assets.length === 0">
      <FwbAlert>No assets yet!</FwbAlert>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <AssetCard v-for="asset in assets" :key="asset.assetId" :asset="asset" />
    </div>

    <div class="mt-4">
    </div>
  </div>
</template>