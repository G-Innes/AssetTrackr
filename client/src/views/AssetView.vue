<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AssetForm from '../components/AssetForm.vue';
import { FwbAlert, FwbButton } from 'flowbite-vue';
import { createAsset } from '../services/apiService';

const router = useRouter();
const showAlert = ref(false);
const alertMessage = ref('');

const handleSubmit = async (payload: {
  userId: number;
  assetId: number;
  quantity: number;
  name: string;
  ticker: string;
  current_price: number;
}) => {
  try {
    await createAsset(payload);
    showAlert.value = true;
    alertMessage.value = 'Asset form submitted successfully!';
  } catch (error) {
    showAlert.value = true;
    alertMessage.value = 'Failed to submit asset form. Please try again.';
    console.error('Error submitting asset form:', error);
  }
};

const goToDashboard = () => {
  router.push({ name: 'Dashboard' });
};
</script>

<template>
  <div class="AssetView">
    <FwbAlert v-model:show="showAlert" variant="success">
      {{ alertMessage }}
    </FwbAlert>

    <AssetForm @submit="handleSubmit" />

    <div class="mt-4">
      <FwbButton @click="goToDashboard">Go back to Dashboard</FwbButton>
    </div>
  </div>
</template>
