<script lang="ts" setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AssetForm from '../components/AssetForm.vue'
import { api, getErrorMessage } from '@/services/api'
import { formatQuantity } from '@/utils/format'
import type { NewTransaction } from '@/types'

const route = useRoute()
const router = useRouter()

const form = ref<InstanceType<typeof AssetForm> | null>(null)
const initialTicker = typeof route.query.ticker === 'string' ? route.query.ticker : undefined

const isSubmitting = ref(false)
const showAlert = ref(false)
const alertMessage = ref('')
const alertType = ref<'success' | 'error'>('success')
let hideAlertTimer: ReturnType<typeof setTimeout> | undefined

function notify(type: 'success' | 'error', message: string) {
  alertType.value = type
  alertMessage.value = message
  showAlert.value = true
  clearTimeout(hideAlertTimer)
  // Errors stay up longer: they need reading, not just noticing.
  hideAlertTimer = setTimeout(() => (showAlert.value = false), type === 'success' ? 2500 : 6000)
}

async function handleSubmit(payload: NewTransaction) {
  isSubmitting.value = true
  try {
    const transaction = await api.createTransaction(payload)
    const verb = transaction.type === 'buy' ? 'Bought' : 'Sold'
    notify('success', `${verb} ${formatQuantity(transaction.quantity)} ${transaction.asset.ticker}`)
    form.value?.reset()
  } catch (error) {
    notify('error', getErrorMessage(error, 'Failed to submit transaction. Please try again.'))
  } finally {
    isSubmitting.value = false
  }
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
        :role="alertType === 'error' ? 'alert' : 'status'"
        :class="[
          'fixed left-0 top-0 z-50 w-full p-4 text-center text-xl font-medium text-white backdrop-blur-sm',
          alertType === 'success' ? 'bg-success-600/90' : 'bg-danger-600/90',
        ]"
      >
        {{ alertMessage }}
      </div>
    </transition>

    <AssetForm
      ref="form"
      :initial-ticker="initialTicker"
      :is-submitting="isSubmitting"
      @submit="handleSubmit"
    />

    <div class="mt-6 flex justify-center">
      <button
        class="shadow-glow-primary rounded-lg bg-primary-600 px-5 py-3 text-white transition hover:bg-primary-500"
        @click="goToDashboard"
      >
        Go back to Dashboard
      </button>
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
