<script lang="ts" setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import PageForm from '@/components/PageForm.vue'
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
  <PageForm heading="Create an account" form-label="Signup" @submit="submitSignup">
    <div>
      <label for="email" class="field-label">Email</label>
      <input
        id="email"
        v-model="userForm.email"
        type="email"
        required
        autocomplete="email"
        class="field"
      />
    </div>

    <div>
      <label for="username" class="field-label">Username</label>
      <input
        id="username"
        v-model="userForm.username"
        type="text"
        required
        autocomplete="username"
        autocapitalize="none"
        class="field"
      />
    </div>

    <div>
      <label for="password" class="field-label">Password</label>
      <input
        id="password"
        v-model="userForm.password"
        type="password"
        required
        autocomplete="new-password"
        aria-describedby="password-hint"
        class="field"
      />
      <p id="password-hint" class="text-dark-500 mt-1 text-xs">At least 8 characters.</p>
    </div>

    <div>
      <label for="confirmPassword" class="field-label">Confirm Password</label>
      <input
        id="confirmPassword"
        v-model="userForm.confirmPassword"
        type="password"
        required
        autocomplete="new-password"
        class="field"
      />
    </div>

    <p v-if="errorMessage" class="notice-error" role="alert" data-testid="errorMessage">
      {{ errorMessage }}
    </p>

    <button type="submit" :disabled="isSubmitting" class="btn-primary w-full">
      {{ isSubmitting ? 'Creating account…' : 'Sign up' }}
    </button>

    <template #footer>
      <p class="text-dark-400 mt-6 text-center text-sm">
        Already have an account?
        <RouterLink :to="{ name: 'Login' }" class="text-primary-400 hover:text-primary-300">
          Log in
        </RouterLink>
      </p>
    </template>
  </PageForm>
</template>
