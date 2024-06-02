<script lang="ts" setup>
import { ref } from 'vue'
import { FwbAlert, FwbButton } from 'flowbite-vue'


</script>

<template>
  <div class="DashboardView">
    <FwbAlert>No assets yet!</FwbAlert>

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