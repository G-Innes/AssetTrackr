<script lang="ts" setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageForm from '../components/PageForm.vue'
import { getErrorMessage } from '@/services/api'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const userForm = ref({
  usernameOrEmail: '',
  password: '',
})

const isSubmitting = ref(false)
const errorMessage = ref('')

async function submitLogin() {
  const { usernameOrEmail, password } = userForm.value
  if (!usernameOrEmail || !password) {
    errorMessage.value = 'Username/Email and password are required'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''
  try {
    await userStore.login(usernameOrEmail, password)
    // Return to the page that asked for a login, if it was one of ours.
    const redirect = route.query.redirect
    await router.push(
      typeof redirect === 'string' && redirect.startsWith('/dashboard')
        ? redirect
        : { name: 'Dashboard' }
    )
  } catch (error) {
    errorMessage.value = getErrorMessage(error, 'Login failed')
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

  <PageForm heading="Log in to your account" formLabel="Login" @submit="submitLogin">
    <template #default>
      <div class="mb-4">
        <label for="usernameOrEmail" class="mb-2 block text-sm font-medium text-dark-200"
          >Username or Email</label
        >
        <input
          id="usernameOrEmail"
          type="text"
          v-model="userForm.usernameOrEmail"
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
          required
          autocomplete="current-password"
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
          {{ isSubmitting ? 'Logging in…' : 'Log in' }}
        </button>
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
</style>
