<script lang="ts" setup>
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import DemoButton from '@/components/DemoButton.vue'
import PageForm from '@/components/PageForm.vue'
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
  <PageForm heading="Log in" form-label="Login" @submit="submitLogin">
    <div>
      <label for="usernameOrEmail" class="field-label">Username or Email</label>
      <input
        id="usernameOrEmail"
        v-model="userForm.usernameOrEmail"
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
        autocomplete="current-password"
        class="field"
      />
    </div>

    <p v-if="errorMessage" class="notice-error" role="alert" data-testid="errorMessage">
      {{ errorMessage }}
    </p>

    <button type="submit" :disabled="isSubmitting" class="btn-primary w-full">
      {{ isSubmitting ? 'Logging in…' : 'Log in' }}
    </button>

    <template #footer>
      <div class="my-5 flex items-center gap-3 text-xs">
        <span class="h-px flex-1 bg-white/10" />
        <span class="text-dark-500">or</span>
        <span class="h-px flex-1 bg-white/10" />
      </div>
      <DemoButton class="btn-quiet w-full" />
      <p class="text-dark-500 mt-2 text-center text-xs">A sample portfolio, no sign-up needed.</p>

      <p class="text-dark-400 mt-6 text-center text-sm">
        No account?
        <RouterLink :to="{ name: 'Signup' }" class="text-primary-400 hover:text-primary-300">
          Sign up
        </RouterLink>
      </p>
    </template>
  </PageForm>
</template>
