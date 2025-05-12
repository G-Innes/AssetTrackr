<script lang="ts" setup>
import { ref } from 'vue'
import PageForm from '../components/PageForm.vue'
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
          autocomplete="current-password"
          class="w-full rounded-lg border border-white/10 bg-transparent p-2.5 text-white focus:border-dark-900 focus:outline-none focus:ring-2 focus:ring-dark-900/60"
        />
      </div>

      <div
        v-if="hasSucceeded"
        class="mb-4 rounded-lg bg-success-600/20 p-4 text-white"
        data-testid="successMessage"
      >
        You have successfully logged in.
        <RouterLink :to="{ name: 'Dashboard' }" class="font-semibold text-white underline"
          >Go to the Dashboard</RouterLink
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
          Log in
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
