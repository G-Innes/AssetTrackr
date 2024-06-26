<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { signup } from '../services/apiService'
import PageForm from '../components/PageForm.vue'
import { FwbAlert, FwbButton, FwbInput } from 'flowbite-vue'

const router = useRouter()

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
    await signup({ email, userName, password, confirmPassword })

    errorMessage.value = ''

    // Display success message
    hasSucceeded.value = true

    // Redirect to login page after delay
    setTimeout(() => {
      router.push({ name: 'Login' })
    }, 2000)
  } catch (error: any) {
    // Set error, which will be automatically displayed
    errorMessage.value = error.response?.data?.message || error.message || 'Unknown error'
  }
}
</script>

<template>
  <nav class="memphis-header">
    <div class="container mx-auto flex items-center justify-between">
      <router-link to="/" class="navbar-link">
        <slot name="logo"><span class="logo font-sans">AssetTrackr</span></slot>
      </router-link>
    </div>
  </nav>
  <PageForm heading="Sign up for an account" formLabel="Signup" @submit="submitSignup">
    <template #default>
      <FwbInput
        class="focus:ring-black-500 focus:border-black-500"
        label="Email"
        type="email"
        v-model="userForm.email"
        :required="true"
      />

      <FwbInput
        class="focus:ring-black-500 focus:border-black-500"
        label="Username"
        type="text"
        v-model="userForm.userName"
        :required="true"
      />

      <FwbInput
        class="focus:ring-black-500 focus:border-black-500"
        label="Password"
        type="password"
        v-model="userForm.password"
        :required="true"
      />

      <FwbInput
        class="focus:ring-black-500 focus:border-black-500"
        label="Confirm Password"
        type="password"
        v-model="userForm.confirmPassword"
        :required="true"
      />

      <FwbAlert v-if="hasSucceeded" data-testid="successMessage" type="success">
        You have successfully signed up!
        <RouterLink
          :to="{ name: 'Login' }"
          class="font-semibold leading-6 text-black hover:text-white"
          >Go to the login page</RouterLink
        >
      </FwbAlert>
      <AlertError v-if="errorMessage" :message="errorMessage">
        {{ errorMessage }}
      </AlertError>

      <div class="grid">
        <FwbButton
          class="bg-black text-white hover:bg-white hover:text-black"
          type="submit"
          size="xl"
          >Sign up</FwbButton
        >
      </div>
    </template>

    <template #footer>
      <FwbAlert class="bg-transparent text-center">
        Already a member?
        {{ ' ' }}
        <RouterLink
          :to="{ name: 'Login' }"
          class="font-semibold leading-6 text-black hover:text-white"
          >Log in</RouterLink
        >
      </FwbAlert>
    </template>
  </PageForm>
</template>

<style scoped>
.memphis-header {
  background-color: #cccccc;

  box-shadow: 0 4px 0 #121212;
  padding: 0.5rem 1rem;
}

.memphis-header .navbar-link {
  font-weight: bold;
  text-decoration: none;
  padding: 0.5rem 1rem;
}

.memphis-header .navbar-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 0.25rem;
  color: #1a5138;
}
.logo {
  font-size: 1.4rem;
  position: relative;
  display: inline-block;
  overflow: hidden;
  animation: change 10s infinite linear;
}
@keyframes change {
  0% {
    width: 100%;
    color: #1c90a0;
  }
  20% {
    width: 100%;
    color: #58a1ae;
  }
  30% {
    width: 100%;
    color: #339c7c;
  }
  100% {
    width: 100%;
    color: #2e8666;
  }
}
</style>
