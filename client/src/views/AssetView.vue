<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AssetForm from '../components/AssetForm.vue'
import { FwbButton } from 'flowbite-vue'
import { createAsset } from '../services/apiService'

const router = useRouter()
const showAlert = ref(false)
const alertMessage = ref('')
const alertType = ref('success')

const handleSubmit = async (payload: {
  userId: number
  assetId: number
  quantity: number
  name: string
  ticker: string
  current_price: number
}) => {
  try {
    await createAsset(payload)
    showAlert.value = true
    alertMessage.value = 'Transaction Complete!'
    alertType.value = 'success'
  } catch (error: unknown) {
    // Directly assert the error type to access its properties
    const errorMessage = (error as any).response?.data?.message || 'Failed to submit transaction. Please try again.';
    alertMessage.value = errorMessage;
    console.error('Error submitting asset form:', error);
    showAlert.value = true;
    alertType.value = 'error'
  }
  // Hide the alert after 3 seconds
  setTimeout(() => {
    showAlert.value = false
  }, 1500)
}

const goToDashboard = () => {
  router.push({ name: 'Dashboard' })
}
</script>

<template>
  <div class="AssetView">
    <transition name="fade">
      <div
        v-if="showAlert"
        :class="[
          'PLS fixed left-0 top-0 w-full p-4 text-center text-2xl text-white',
          alertType === 'success' ? 'bg-green-600' : 'bg-red-600'
        ]"
      >
        {{ alertMessage }}
      </div>
    </transition>

    <AssetForm @submit="handleSubmit" />

    <div class="mt-4 flex justify-center">
      <FwbButton class="bg-black text-white hover:bg-white hover:text-black" @click="goToDashboard"
        >Go back to Dashboard</FwbButton
      >
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
