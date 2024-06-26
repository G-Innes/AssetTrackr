<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const { links } = defineProps<{
  links: {
    label: string
    name: string
    to: string
  }[]
}>()

const route = useRoute()

const navigation = computed(() =>
  links.map((item) => ({
    ...item,
    isActive: route.name === item.name,
  }))
)

const isMenuOpen = ref(false)

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}
</script>

<template>
  <nav class="memphis-header">
    <div class="container mx-auto flex items-center justify-between">
      <router-link to="/" class="navbar-link">
        <slot name="logo"><span class="logo font-sans">AssetTrackr</span></slot>
      </router-link>
      <div class="hidden space-x-4 md:flex">
        <router-link
          v-for="link in navigation"
          :key="link.name"
          :to="link.to"
          :class="['navbar-link', { 'text-white-900': link.isActive }]"
        >
          {{ link.label }}
        </router-link>
      </div>
      <div class="flex items-center md:hidden">
        <button
          @click="toggleMenu"
          class="text-gray-400 hover:text-white focus:text-white focus:outline-none"
        >
          <svg
            class="h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>
      </div>
    </div>
    <div v-show="isMenuOpen" class="md:hidden">
      <div class="space-y-1 px-2 pb-3 pt-2 sm:px-3">
        <router-link
          v-for="link in navigation"
          :key="link.name"
          :to="link.to"
          :class="[
            'block rounded-md px-3 py-2 text-base font-medium text-white',
            { 'bg-gray-900': link.isActive },
          ]"
        >
          {{ link.label }}
        </router-link>
      </div>
    </div>
  </nav>

  <main>
    <div class="container mx-auto px-6 py-8">
      <RouterView />
    </div>
  </main>
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
