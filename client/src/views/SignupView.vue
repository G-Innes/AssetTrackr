<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { signup } from '../services/apiService';
import PageForm from '../components/PageForm.vue';
import { FwbAlert, FwbButton, FwbInput } from 'flowbite-vue';


const router = useRouter();

const userForm = ref({
  email: '',
  userName: '',
  password: '',
  confirmPassword: '',

});

const hasSucceeded = ref(false);
const errorMessage = ref('');

async function submitSignup() {
  try {
    // Destructure the userForm.value object
    const { email, userName, password, confirmPassword } = userForm.value;


    if (!email || !userName || !password || !confirmPassword) {
      errorMessage.value = 'Username, email, and password & confirmation are required';
      return;
    }

    if (password !== confirmPassword) {
      errorMessage.value = 'Passwords do not match';
      return;
    }

    // Call signup with user data
    await signup({ email, userName, password, confirmPassword });

    errorMessage.value = '';

    // Display success message
    hasSucceeded.value = true;

    // Redirect to login page after delay
    setTimeout(() => {
      router.push({ name: 'Login' });
    }, 2000);
  } catch (error: any) {
    // Set error, which will be automatically displayed
    errorMessage.value = error.response?.data?.message || error.message || 'Unknown error';
  }
}




</script>

<template>
  <PageForm heading="Sign up for an account" formLabel="Signup" @submit="submitSignup">
    <template #default>
      <FwbInput label="Email" type="email" v-model="userForm.email" :required="true" />

      <FwbInput label="Username" type="text" v-model="userForm.userName" :required="true" />

      <FwbInput label="Password" type="password" v-model="userForm.password" :required="true" />

      <FwbInput label="Confirm Password" type="password" v-model="userForm.confirmPassword" :required="true" />


      <FwbAlert v-if="hasSucceeded" data-testid="successMessage" type="success">
        You have successfully signed up! You will be redirected to the login page.
        <RouterLink
          :to="{ name: 'Login' }"
          class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
          >Go to the login page</RouterLink
        >
      </FwbAlert>
      <AlertError v-if="errorMessage" :message="errorMessage">
        {{ errorMessage }}
      </AlertError>

      <div class="grid">
        <FwbButton color="default" type="submit" size="xl">Sign up</FwbButton>
      </div>
    </template>

    <template #footer>
      <FwbAlert class="bg-transparent text-center">
        Already a member?
        {{ ' ' }}
        <RouterLink
          :to="{ name: 'Login' }"
          class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
          >Log in</RouterLink
        >
      </FwbAlert>
    </template>
  </PageForm>
</template>
