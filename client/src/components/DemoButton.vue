<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getErrorMessage } from '@/services/api'
import { useUserStore } from '@/stores/user'

/** Opens a throwaway account with a sample portfolio: no sign-up needed to look around. */
const router = useRouter()
const userStore = useUserStore()
const isStarting = ref(false)
const error = ref('')

async function start() {
  if (isStarting.value) return
  isStarting.value = true
  error.value = ''
  try {
    await userStore.startDemo()
    await router.push({ name: 'Dashboard' })
  } catch (failure) {
    error.value = getErrorMessage(failure, 'Could not start the demo. Please try again.')
  } finally {
    isStarting.value = false
  }
}
</script>

<template>
  <button type="button" :disabled="isStarting" v-bind="$attrs" @click="start">
    <slot :is-starting="isStarting">{{ isStarting ? 'Setting up…' : 'Try the demo' }}</slot>
  </button>
  <p v-if="error" role="alert" class="text-danger-400 mt-2 text-sm">{{ error }}</p>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>
