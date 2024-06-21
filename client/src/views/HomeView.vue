<script lang="ts" setup>
import { FwbButton } from 'flowbite-vue'
</script>

<template>
  <div class="memphis-bg min-h-screen flex flex-col items-center justify-center">
    
    <div class="memphis-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      <div class="memphis-card memphis-square p-6">
        <h2 class="memphis-title">Welcome to Our App</h2>
        <p class="memphis-text">Discover the amazing features we offer. Join us today!</p>
        <div class="flex space-x-4 mt-4">
          <FwbButton component="RouterLink" tag="router-link" :href="({ name: 'Signup' } as any)" class="bg-black text-white hover:bg-white hover:text-black">Get Started</FwbButton>
          <FwbButton component="RouterLink" tag="router-link" color="alternative" :href="({ name: 'Login' } as any)" class="bg-white text-black hover:bg-black hover:text-white">Log in</FwbButton>
        </div>
      </div>
      
      <div class="memphis-card memphis-rectangle p-6">
        <h2 class="memphis-title">Features</h2>
        <p class="memphis-text">Explore the diverse set of tools we provide to make your life easier.</p>
      </div>
      
      <div class="memphis-card memphis-square p-6">
        <h2 class="memphis-title">Community</h2>
        <p class="memphis-text">Connect with like-minded individuals and share your experiences.</p>
      </div>
    
      <div class="memphis-card memphis-portrait p-6">
        <h2 class="memphis-title">About Us</h2>
        <p class="memphis-text">Learn more about our mission and values.</p>
      </div>
      
      <div class="memphis-card memphis-rectangle p-6">
        <h2 class="memphis-title">FAQ</h2>
        <p class="memphis-text">Find answers to commonly asked questions about our services.</p>
      </div>
      
      <div class="memphis-card memphis-square p-6">
        <h2 class="memphis-title">Contact</h2>
        <p class="memphis-text">Reach out to us if you have any questions or feedback.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.memphis-bg {
  background-color: #f5f5f500;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.memphis-container {
  max-width: 1200px;
  width: 100%;
  padding: 0 1rem;
}

.memphis-card {
  background-color: #CCCCCC;
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

.memphis-portrait {
  grid-column: span 1;
  grid-row: span 2;
}

@media (max-width: 767px) {
  .memphis-container {
    grid-template-columns: repeat(1, 1fr);
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .memphis-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .memphis-container {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>