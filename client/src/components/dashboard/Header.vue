<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDashboardStore } from '@/stores/dashboard'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const dashboardStore = useDashboardStore()
const dropdownOpen = ref(false)

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const handleLogout = () => {
  userStore.logout()
  dashboardStore.reset()
  router.push('/login')
}
</script>

<template>
  <header class="sticky top-0 z-10 flex h-16 shrink-0 items-center backdrop-blur-md">
    <div
      class="glass-card bg-glass-gradient flex flex-1 items-center justify-between border-b border-white/10 px-4 sm:px-6 lg:px-8"
    >
      <!-- Page title -->
      <div class="hidden lg:flex lg:items-center lg:gap-2">
        <h1 class="text-lg font-semibold text-white">AssetTrackr</h1>
      </div>

      <!-- User Menu -->
      <div class="relative ml-auto flex items-center gap-x-4">
        <!-- User dropdown -->
        <div class="relative">
          <button
            type="button"
            class="flex items-center gap-x-2 rounded-lg p-1.5 text-sm transition-all duration-200 hover:bg-white/5"
            @click="toggleDropdown"
          >
            <span class="sr-only">Open user menu</span>
            <div
              class="shadow-glow-primary bg-primary-500 ring-primary-500/30 hover:ring-primary-500/50 flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium text-white ring-2 transition-all duration-200"
            >
              {{ userStore.user?.username.charAt(0).toUpperCase() ?? '' }}
            </div>
            <span
              class="text-dark-200 hidden text-sm font-medium transition-colors duration-200 group-hover:text-white md:block"
            >
              {{ userStore.user?.username }}
            </span>
          </button>

          <!-- Dropdown menu -->
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-1"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 translate-y-1"
          >
            <div
              v-if="dropdownOpen"
              class="glass-card bg-glass-gradient absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg border border-white/10 py-1 shadow-lg ring-1 ring-white/5 backdrop-blur-sm focus:outline-none"
            >
              <button
                class="text-dark-200 block w-full px-4 py-2 text-left text-sm transition-colors duration-150 hover:bg-white/10 hover:text-white"
                @click="handleLogout"
              >
                Sign out
              </button>
            </div>
          </Transition>
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
