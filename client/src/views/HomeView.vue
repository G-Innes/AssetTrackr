<script lang="ts" setup>
import { FwbButton } from 'flowbite-vue'
</script>

<template>
  <div
    style="background-color: #a0c4ff"
    class="memphis-card m-auto flex w-full flex-col items-center p-8 text-center"
  >
    <h1 class="text-3xl font-bold">AssetTrackr App</h1>
    <p class="mt-2">Your tool for financial success</p>
  </div>

  <div
    class="container1 align-center flex min-h-screen w-full flex-col items-center justify-center"
  >
    <div class="memphis-container grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
      <div style="background-color: #c1e1c1" class="memphis-card memphis-square p-6">
        <h2 class="memphis-title">Welcome to Our App</h2>
        <p class="memphis-text">Discover the amazing features we offer. Join us today!</p>
        <div class="mt-4 flex space-x-4">
          <FwbButton
            component="RouterLink"
            tag="router-link"
            :href="{ name: 'Signup' } as any"
            class="bg-black text-white hover:bg-white hover:text-black"
            >Get Started</FwbButton
          >
          <FwbButton
            component="RouterLink"
            tag="router-link"
            color="alternative"
            :href="{ name: 'Login' } as any"
            class="bg-white text-black hover:bg-black hover:text-white"
            >Log in</FwbButton
          >
        </div>
      </div>

      <div style="background-color: #e6f2ff" class="memphis-card memphis-rectangle p-6">
        <h2 class="memphis-title">Features</h2>
        <p class="memphis-text">
          Add your portfolio holdings to our platform through transactions.
        </p>
        <p class="memphis-text">Keep track of your portfolio value in real time.</p>
        <p class="memphis-text">View your full transaction history on the platform.</p>
      </div>

      <div style="background-color: #cabbe9" class="memphis-card memphis-square p-6">
        <h2 class="memphis-title">Community</h2>
        <p class="memphis-text">Join our community of like-minded individuals on Discord.</p>
      </div>

      <div style="background-color: #fffacd" class="memphis-card memphis-square p-6">
        <h2 class="memphis-title">About us</h2>
        <p class="memphis-text">Reach out to us if you have any questions or feedback.</p>
      </div>

      <div style="background-color: #fce4ec" class="memphis-card memphis-square p-6">
        <h2 class="memphis-title">Contact</h2>
        <p class="memphis-text">Reach out to us if you have any questions or feedback.</p>
      </div>

      <div style="background-color: #a0e7e5" class="memphis-card memphis-rectangle p-6">
        <h2 class="memphis-title">FAQ</h2>
        <p class="memphis-text">Find answers to commonly asked questions about our services.</p>
      </div>

      <div style="background-color: #ead8c3" class="memphis-card memphis-square p-6">
        <h2 class="memphis-title">Contact</h2>
        <p class="memphis-text">Reach out to us if you have any questions or feedback.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container1 {
  margin-top: -2rem;
}

.memphis-container {
  max-width: 1200px;
  width: 100%;
  padding: 0 1rem;
}

.memphis-card {
  background-color: #cccccc;
  color: #121212;
  box-shadow: 10px 10px 0 #121212;
  border-radius: 10px;
  transition: transform 0.2s;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.memphis-card:hover {
  transform: translate(-5px, -5px);
}

.memphis-title {
  font-size: 24px;
  font-weight: bold;
  color: #121212;
}

.memphis-text {
  font-size: 16px;
  color: #121212;
}

.memphis-square {
  grid-column: span 1;
  grid-row: span 1;
}

.memphis-rectangle {
  grid-column: span 2;
  grid-row: span 1;
}

@media (max-width: 767px) {
  .memphis-container {
    grid-template-columns: repeat(1, 1fr);
  }
  .container1 {
    margin-top: 4rem;
  }
  .memphis-rectangle {
    grid-column: span 1;
  }
  h1 {
    font-size: 32px;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .memphis-container {
    grid-template-columns: repeat(2, 1fr);
  }
  .container1 {
    margin-top: 4rem;
  }
  .memphis-rectangle {
    grid-column: span 1;
  }
}

@media (min-width: 1024px) {
  .memphis-container {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
