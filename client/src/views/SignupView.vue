<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import PageForm from '../components/PageForm.vue'
import { FwbAlert, FwbButton, FwbInput } from 'flowbite-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const userForm = ref({
  email: '',
  userName: '',
  password: '',
  confirmPassword: '',
})

const hasSucceeded = ref(false)
const errorMessage = ref('')

async function submitSignup() {
  try {
    // Destructure the userForm.value object
    const { email, userName, password, confirmPassword } = userForm.value

    if (!email || !userName || !password || !confirmPassword) {
      errorMessage.value = 'Username, email, and password & confirmation are required'
      return
    }

    if (password !== confirmPassword) {
      errorMessage.value = 'Passwords do not match'
      return
    }

    // Call signup with user data
    const result = await userStore.signup({ 
      email, 
      userName, 
      password, 
      confirmPassword 
    })

    if (result.success) {
      errorMessage.value = ''
      // Display success message
      hasSucceeded.value = true
      // Redirect to login page after delay
      setTimeout(() => {
        router.push({ name: 'Login' })
      }, 2000)
    } else {
      errorMessage.value = result.message || 'Signup failed'
    }
  } catch (error: any) {
    // Set error, which will be automatically displayed
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
  
  <PageForm heading="Sign up for an account" formLabel="Signup" @submit="submitSignup">
    <template #default>
      <FwbInput
        class="signup-input"
        label="Email"
        labelClass="text-dark-200"
        type="email"
        v-model="userForm.email"
        :required="true"
      />

      <FwbInput
        class="signup-input"
        label="Username"
        labelClass="text-dark-200"
        type="text"
        v-model="userForm.userName"
        :required="true"
      />

      <FwbInput
        class="signup-input"
        label="Password"
        labelClass="text-dark-200"
        type="password"
        v-model="userForm.password"
        :required="true"
      />

      <FwbInput
        class="signup-input"
        label="Confirm Password"
        labelClass="text-dark-200"
        type="password"
        v-model="userForm.confirmPassword"
        :required="true"
      />

      <FwbAlert v-if="hasSucceeded" data-testid="successMessage" type="success">
        You have successfully signed up!
        <RouterLink
          :to="{ name: 'Login' }"
          class="font-semibold text-white"
          >Go to the login page</RouterLink
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
          >Sign up</FwbButton
        >
      </div>
    </template>

    <template #footer>
      <div class="mt-4 text-center text-sm text-dark-300">
        Already a member?
        <RouterLink
          :to="{ name: 'Login' }"
          class="font-semibold text-primary-400 hover:text-primary-300"
          >Log in</RouterLink
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

.signup-input :deep(input) {
  background-color: transparent !important;
  color: white !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}

.signup-input :deep(input:focus) {
  --tw-ring-color: rgb(15, 23, 42) !important;
  --tw-ring-offset-color: rgb(15, 23, 42) !important;
  border-color: rgb(15, 23, 42) !important;
  box-shadow: 0 0 0 2px rgba(15, 23, 42, 0.6) !important;
}
</style>
