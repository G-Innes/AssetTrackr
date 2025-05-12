<script lang="ts" setup>
import { ref } from 'vue'
import PageForm from '../components/PageForm.vue'
import { FwbAlert, FwbButton, FwbInput } from 'flowbite-vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// allow login with either username or email
const userForm = ref({
  usernameOrEmail: '',
  password: '',
})

const hasSucceeded = ref(false)
const errorMessage = ref('')

async function submitLogin() {
  try {
    const { usernameOrEmail, password } = userForm.value

    // Check if usernameOrEmail and password are provided
    if (!usernameOrEmail || !password) {
      errorMessage.value = 'Username/Email and password are required'
      return
    }

    // Login via store
    const result = await userStore.login(usernameOrEmail, password)
    
    if (result.success) {
      // Display success message & redirect to dashboard
      hasSucceeded.value = true
      setTimeout(() => {
        router.push({ name: 'Dashboard' })
      }, 500)
    } else {
      errorMessage.value = result.message || 'Login failed'
    }
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || error.message || 'Unknown error'
  }
}
</script>

<template>
  <!-- Header -->
  <header class="fixed top-0 z-10 w-full backdrop-blur-sm">
    <div class="glass-card border-b border-white/10 px-6 py-4">
      <div class="mx-auto flex items-center justify-between">
        <router-link to="/" class="text-xl font-bold text-white">
          AssetTrackr
        </router-link>
      </div>
    </div>
  </header>
  
  <PageForm heading="Log in to your account" formLabel="Login" @submit="submitLogin">
    <template #default>
      <FwbInput
        class="login-input"
        label="Username or Email"
        labelClass="text-dark-200"
        type="text"
        v-model="userForm.usernameOrEmail"
        :required="true"
      />

      <FwbInput
        label="Password"
        labelClass="text-dark-200"
        id="password"
        name="password"
        type="password"
        autocomplete="current-password"
        v-model="userForm.password"
        :required="true"
        class="login-input"
      />
      <FwbAlert v-if="hasSucceeded" data-testid="successMessage" type="success">
        You have successfully logged in.
        <RouterLink
          :to="{ name: 'Dashboard' }"
          class="font-semibold text-white"
          >Go to the Dashboard</RouterLink
        >
      </FwbAlert>
      <FwbAlert v-if="errorMessage" data-testid="errorMessage" type="danger">
        {{ errorMessage }}
      </FwbAlert>

      <div class="grid">
        <FwbButton
          class="bg-primary-600 text-white shadow-glow-primary hover:bg-primary-500"
          type="submit"
          size="xl"
          >Log in</FwbButton
        >
      </div>
    </template>

    <template #footer>
      <div class="mt-4 text-center text-sm text-dark-300">
        Not a member?
        <RouterLink
          :to="{ name: 'Signup' }"
          class="font-semibold text-primary-400 hover:text-primary-300"
          >Sign up</RouterLink
        >
      </div>
    </template>
  </PageForm>
</template>

<style scoped>
.glass-card {
  background-color: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.login-input :deep(input) {
  background-color: transparent !important;
  color: white !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}

.login-input :deep(input:focus) {
  --tw-ring-color: rgb(15, 23, 42) !important;
  --tw-ring-offset-color: rgb(15, 23, 42) !important;
  border-color: rgb(15, 23, 42) !important;
  box-shadow: 0 0 0 2px rgba(15, 23, 42, 0.6) !important;
}
</style>
