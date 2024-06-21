<script lang="ts" setup>
import { login } from '../services/apiService'
import { ref } from 'vue'
import PageForm from '../components/PageForm.vue'
import { FwbAlert, FwbButton, FwbInput } from 'flowbite-vue'
import { useRouter } from 'vue-router'


const router = useRouter()

// allow login with either username or email

const userForm = ref({
  usernameOrEmail: '',
  password: '',
})

const hasSucceeded = ref(false);
const errorMessage = ref('');

async function submitLogin() {
  try {
    const { usernameOrEmail, password } = userForm.value;

    // Check if usernameOrEmail and password are provided
    if (!usernameOrEmail || !password) {
      errorMessage.value = 'Username/Email and password are required';
      return;
    }

    // Check for email or username
    const isEmail = usernameOrEmail.includes('@');

    // Create the appropriate login payload
    let loginPayload: { usernameOrEmail: string; password: string };

    if (isEmail) {
      loginPayload = { usernameOrEmail, password };
    } else {
      loginPayload = { usernameOrEmail, password };
    }

    // Call the login function
    const response = await login(loginPayload);

    // Store the token in localStorage
    localStorage.setItem('token', response.data.token);

    // Display success message & redirect to dashboard
    hasSucceeded.value = true;

    setTimeout(() => {
      router.push({ name: 'Dashboard' });
    }, 500);
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || error.message || 'Unknown error';
  }
}
</script>

<template>
  <PageForm heading="Log in to your account" formLabel="Login" @submit="submitLogin">
    <template #default>
      <FwbInput class="focus:ring-black-500 focus:border-black-500"  label="Username or Email" type="text" v-model="userForm.usernameOrEmail" :required="true" />

      <FwbInput
        label="Password"
        id="password"
        name="password"
        type="password"
        autocomplete="current-password"
        v-model="userForm.password"
        :required="true"
        class="focus:ring-black-500 focus:border-black-500" 
      />
      <FwbAlert v-if="hasSucceeded" data-testid="successMessage" type="success">
        You have successfully logged in.
        <RouterLink
          :to="{ name: 'Dashboard' }"
          class="font-semibold leading-6 text-black hover:white"
          >Go to the Dashboard</RouterLink
        >
      </FwbAlert>
      <FwbAlert v-if="errorMessage" data-testid="errorMessage" type="danger">
        {{ errorMessage }}
      </FwbAlert>

      <div class="grid">
        <FwbButton class="bg-black text-white hover:bg-white hover:text-black" type="submit" size="xl">Log in</FwbButton>
      </div>
    </template>

    <template #footer>
      <FwbAlert class="bg-transparent text-center">
        Not a member?
        {{ ' ' }}
        <RouterLink
          :to="{ name: 'Signup' }"
          class="font-semibold leading-6 text-black hover:text-white"
          >Sign up</RouterLink
        >
      </FwbAlert>
    </template>
  </PageForm>
</template>
