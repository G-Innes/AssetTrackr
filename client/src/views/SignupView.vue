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

  <PageForm heading="Sign up for an account" formLabel="Signup" @submit="submitSignup">
    <template #default>
      <div class="mb-4">
        <label for="email" class="mb-2 block text-sm font-medium text-dark-200">Email</label>
        <input
          id="email"
          type="email"
          v-model="userForm.email"
          required
          class="w-full rounded-lg border border-white/10 bg-white/5 p-2.5 text-white transition-all duration-200 placeholder:text-dark-400 focus:border-primary-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      <div class="mb-4">
        <label for="username" class="mb-2 block text-sm font-medium text-dark-200">Username</label>
        <input
          id="username"
          type="text"
          v-model="userForm.username"
          autocomplete="username"
          minlength="3"
          maxlength="20"
          required
          class="w-full rounded-lg border border-white/10 bg-white/5 p-2.5 text-white transition-all duration-200 placeholder:text-dark-400 focus:border-primary-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      <div class="mb-4">
        <label for="password" class="mb-2 block text-sm font-medium text-dark-200">Password</label>
        <input
          id="password"
          type="password"
          v-model="userForm.password"
          autocomplete="new-password"
          minlength="8"
          maxlength="72"
          required
          class="w-full rounded-lg border border-white/10 bg-white/5 p-2.5 text-white transition-all duration-200 placeholder:text-dark-400 focus:border-primary-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
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
          autocomplete="new-password"
          required
          class="w-full rounded-lg border border-white/10 bg-white/5 p-2.5 text-white transition-all duration-200 placeholder:text-dark-400 focus:border-primary-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
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
          :disabled="isSubmitting"
          class="shadow-glow-primary rounded-lg bg-primary-600 px-5 py-3 text-white transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ isSubmitting ? 'Creating account…' : 'Sign up' }}
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
