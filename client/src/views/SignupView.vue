<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import PageForm from '../components/PageForm.vue'
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
      confirmPassword,
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
        <router-link to="/" class="text-xl font-bold text-white"> AssetTrackr </router-link>
      </div>
    </div>
  </header>

  <PageForm heading="Sign up for an account" formLabel="Signup" @submit="submitSignup">
    <template #default>
      <div class="mb-4">
        <label for="email" class="mb-2 block text-sm font-medium text-dark-200">Email</label>
        <input
          id="email"
          type="email"
          v-model="userForm.email"
          required
          class="w-full rounded-lg border border-white/10 bg-transparent p-2.5 text-white focus:border-dark-900 focus:outline-none focus:ring-2 focus:ring-dark-900/60"
        />
      </div>

      <div class="mb-4">
        <label for="userName" class="mb-2 block text-sm font-medium text-dark-200">Username</label>
        <input
          id="userName"
          type="text"
          v-model="userForm.userName"
          required
          class="w-full rounded-lg border border-white/10 bg-transparent p-2.5 text-white focus:border-dark-900 focus:outline-none focus:ring-2 focus:ring-dark-900/60"
        />
      </div>

      <div class="mb-4">
        <label for="password" class="mb-2 block text-sm font-medium text-dark-200">Password</label>
        <input
          id="password"
          type="password"
          v-model="userForm.password"
          required
          class="w-full rounded-lg border border-white/10 bg-transparent p-2.5 text-white focus:border-dark-900 focus:outline-none focus:ring-2 focus:ring-dark-900/60"
        />
      </div>

      <div class="mb-4">
        <label for="confirmPassword" class="mb-2 block text-sm font-medium text-dark-200"
          >Confirm Password</label
        >
        <input
          id="confirmPassword"
          type="password"
          v-model="userForm.confirmPassword"
          required
          class="w-full rounded-lg border border-white/10 bg-transparent p-2.5 text-white focus:border-dark-900 focus:outline-none focus:ring-2 focus:ring-dark-900/60"
        />
      </div>

      <div
        v-if="hasSucceeded"
        class="mb-4 rounded-lg bg-success-600/20 p-4 text-white"
        data-testid="successMessage"
      >
        You have successfully signed up!
        <RouterLink :to="{ name: 'Login' }" class="font-semibold text-white underline"
          >Go to the login page</RouterLink
        >
      </div>

      <div
        v-if="errorMessage"
        class="mb-4 rounded-lg bg-danger-600/20 p-4 text-white"
        data-testid="errorMessage"
      >
        {{ errorMessage }}
      </div>

      <div class="grid">
        <button
          type="submit"
          class="shadow-glow-primary rounded-lg bg-primary-600 px-5 py-3 text-white transition hover:bg-primary-500"
        >
          Sign up
        </button>
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
</style>
