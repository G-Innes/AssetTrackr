<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()
const dropdownOpen = ref(false)

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<template>
  <header class="sticky top-0 z-10 flex h-16 shrink-0 items-center backdrop-blur-md">
    <div
      class="glass-card flex flex-1 items-center justify-between border-b border-white/10 bg-glass-gradient px-4 sm:px-6 lg:px-8"
    >
      <!-- Mobile Menu Button -->
      <button
        type="button"
        class="text-dark-200 hover:text-white lg:hidden"
        @click="$emit('toggle-mobile-menu')"
      >
        <span class="sr-only">Open sidebar</span>
        <svg
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>

      <!-- Page Title (can be dynamic) -->
      <div class="hidden lg:flex lg:items-center lg:gap-2">
        <h1 class="text-lg font-semibold text-white">AssetTrackr</h1>
      </div>

      <!-- User Menu -->
      <div class="relative ml-auto flex items-center gap-x-4">
        <!-- Notification icon -->
        <button type="button" class="text-dark-300 hover:text-white">
          <span class="sr-only">View notifications</span>
          <svg
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
            />
          </svg>
        </button>

        <!-- User dropdown -->
        <div class="relative">
          <button
            type="button"
            class="flex items-center gap-x-2 rounded-full text-sm"
            @click="toggleDropdown"
          >
            <span class="sr-only">Open user menu</span>
            <div
              class="shadow-glow-primary flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-sm font-medium text-white"
            >
              {{ userStore.user?.firstName?.charAt(0).toUpperCase() || 'U' }}
            </div>
            <span class="hidden text-sm font-medium text-dark-200 md:block">
              {{ userStore.user?.firstName || 'User' }}
            </span>
          </button>

          <!-- Dropdown menu -->
          <div
            v-if="dropdownOpen"
            class="glass-card absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md border border-white/10 bg-glass-gradient py-1 shadow-lg ring-1 ring-white/5 backdrop-blur-sm focus:outline-none"
          >
            <a href="#" class="block px-4 py-2 text-sm text-dark-200 hover:bg-white/10"
              >Your Profile</a
            >
            <a href="#" class="block px-4 py-2 text-sm text-dark-200 hover:bg-white/10">Settings</a>
            <button
              @click="handleLogout"
              class="block w-full px-4 py-2 text-left text-sm text-dark-200 hover:bg-white/10"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.glass-card {
  background-color: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
</style>
