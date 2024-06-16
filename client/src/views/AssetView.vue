<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AssetForm from '../components/AssetForm.vue';
import { FwbButton } from 'flowbite-vue';
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
    alertMessage.value = 'Transaction Completed!';
  } catch (error) {
    alertMessage.value = 'Failed to submit transaction. Please try again.';
    console.error('Error submitting asset form:', error);
  }
  showAlert.value = true;
  // Hide the alert after 3 seconds
  setTimeout(() => {
    showAlert.value = false;
  }, 3000);
};

const goToDashboard = () => {
  router.push({ name: 'Dashboard' });
};
</script>

<template>
  <div class="AssetView">
    <transition name="fade">
      <div v-if="showAlert" class="fixed top-0 left-0 w-full p-4 text-white bg-green-600 text-center text-2xl">
        {{ alertMessage }}
      </div>
    </transition>

    <AssetForm @submit="handleSubmit" />

    <div class="mt-4">
      <FwbButton @click="goToDashboard">Go back to Dashboard</FwbButton>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>