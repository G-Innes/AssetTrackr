<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import PageForm from '../components/PageForm.vue'
import { getErrorMessage } from '@/services/api'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const userForm = ref({
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
})

const isSubmitting = ref(false)
const errorMessage = ref('')

async function submitSignup() {
  const { email, username, password, confirmPassword } = userForm.value

  if (!email || !username || !password || !confirmPassword) {
    errorMessage.value = 'Username, email, password and confirmation are required'
    return
  }
  if (password !== confirmPassword) {
    errorMessage.value = 'Passwords do not match'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''
  try {
    // Signing up also signs you in.
    await userStore.signup({ email, username, password })
    await router.push({ name: 'Dashboard' })
  } catch (error) {
    errorMessage.value = getErrorMessage(error, 'Signup failed')
  } finally {
    isSubmitting.value = false
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

  <PageForm heading="Sign up for an account" form-label="Signup" @submit="submitSignup">
    <template #default>
      <div class="mb-4">
        <label for="email" class="text-dark-200 mb-2 block text-sm font-medium">Email</label>
        <input
          id="email"
          v-model="userForm.email"
          type="email"
          required
          class="placeholder:text-dark-400 focus:border-primary-500/50 focus:ring-primary-500/20 w-full rounded-lg border border-white/10 bg-white/5 p-2.5 text-white transition-all duration-200 focus:bg-white/10 focus:outline-none focus:ring-2"
        />
      </div>

      <div class="mb-4">
        <label for="username" class="text-dark-200 mb-2 block text-sm font-medium">Username</label>
        <input
          id="username"
          v-model="userForm.username"
          type="text"
          autocomplete="username"
          minlength="3"
          maxlength="20"
          required
          class="placeholder:text-dark-400 focus:border-primary-500/50 focus:ring-primary-500/20 w-full rounded-lg border border-white/10 bg-white/5 p-2.5 text-white transition-all duration-200 focus:bg-white/10 focus:outline-none focus:ring-2"
        />
      </div>

      <div class="mb-4">
        <label for="password" class="text-dark-200 mb-2 block text-sm font-medium">Password</label>
        <input
          id="password"
          v-model="userForm.password"
          type="password"
          autocomplete="new-password"
          minlength="8"
          maxlength="72"
          required
          class="placeholder:text-dark-400 focus:border-primary-500/50 focus:ring-primary-500/20 w-full rounded-lg border border-white/10 bg-white/5 p-2.5 text-white transition-all duration-200 focus:bg-white/10 focus:outline-none focus:ring-2"
        />
      </div>

      <div class="mb-4">
        <label for="confirmPassword" class="text-dark-200 mb-2 block text-sm font-medium"
          >Confirm Password</label
        >
        <input
          id="confirmPassword"
          v-model="userForm.confirmPassword"
          type="password"
          autocomplete="new-password"
          required
          class="placeholder:text-dark-400 focus:border-primary-500/50 focus:ring-primary-500/20 w-full rounded-lg border border-white/10 bg-white/5 p-2.5 text-white transition-all duration-200 focus:bg-white/10 focus:outline-none focus:ring-2"
        />
      </div>

      <div
        v-if="errorMessage"
        class="bg-danger-600/20 mb-4 rounded-lg p-4 text-white"
        data-testid="errorMessage"
      >
        {{ errorMessage }}
      </div>

      <div class="grid">
        <button
          type="submit"
          :disabled="isSubmitting"
          class="shadow-glow-primary bg-primary-600 hover:bg-primary-500 rounded-lg px-5 py-3 text-white transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ isSubmitting ? 'Creating account…' : 'Sign up' }}
        </button>
      </div>
    </template>

    <template #footer>
      <div class="text-dark-300 mt-4 text-center text-sm">
        Already a member?
        <RouterLink
          :to="{ name: 'Login' }"
          class="text-primary-400 hover:text-primary-300 font-semibold"
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
