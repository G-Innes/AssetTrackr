<script lang="ts" setup>

import { ref, onMounted } from 'vue';
import { FwbAlert, FwbButton } from 'flowbite-vue'
import AssetCard from '../components/AssetCard.vue';
import { getAllAssetHoldingsForUser } from '@/services/apiService';
import type { Asset } from '@/components/AssetCard.vue';



const assets = ref<Asset[]>([]);

// Fetch assets on component mount
onMounted(async () => {
  try {
    const userAssets: Asset[] = await getAllAssetHoldingsForUser();
    assets.value = userAssets;
  } catch (error) {
    console.error('Error fetching assets:', error);
  }
});

</script>

<template>
  <div class="DashboardView p-4">
    <div v-if="assets.length === 0">
      <FwbAlert>No assets yet!</FwbAlert>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <AssetCard v-for="asset in assets" :key="asset.assetId" :asset="asset" />
    </div>

    <div class="mt-4">

      <!-- prettier-ignore -->
      <FwbButton
        component="RouterLink"
        tag="router-link"
        :href="{ name: 'AssetManage' }"
        data-testid="createAsset"
        size="xl"
      >
        Add a new asset
      </FwbButton>
    </div>
  </div>
</template>