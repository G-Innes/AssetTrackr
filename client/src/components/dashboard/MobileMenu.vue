<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isOpen = ref(false)

// Navigation links
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: 'HomeIcon' },
  { name: 'Buy or Sell', href: '/dashboard/asset-manage', icon: 'ArrowsRightLeftIcon' },
  { name: 'My Transactions', href: '/dashboard/transactions', icon: 'ClockIcon' },
]

// Close menu when route changes
watch(
  () => route.path,
  () => {
    isOpen.value = false
  }
)

// Helper to check if a route is active
const isActive = (href: string) => {
  return route.path === href || route.path.startsWith(`${href}/`)
}

// Toggle menu
const toggleMenu = () => {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <!-- Mobile menu button -->
  <button
    type="button"
    class="glass-card shadow-glow-white fixed right-4 top-4 z-40 rounded-full p-2 text-dark-200 hover:text-white lg:hidden"
    @click="toggleMenu"
  >
    <span class="sr-only">{{ isOpen ? 'Close menu' : 'Open menu' }}</span>
    <svg
      v-if="!isOpen"
      class="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
      />
    </svg>
    <svg
      v-else
      class="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>

  <!-- Mobile menu, shown/hidden based on menu state. -->
  <div v-if="isOpen" class="fixed inset-0 z-30 lg:hidden" @click.self="isOpen = false">
    <!-- Background overlay -->
    <div class="fixed inset-0 bg-dark-900/80 backdrop-blur-sm"></div>

    <!-- Side drawer -->
    <div
      class="glass-card fixed inset-y-0 left-0 z-40 w-full max-w-xs overflow-y-auto border-r border-white/10 bg-glass-gradient px-6 py-4 backdrop-blur-md sm:max-w-sm"
    >
      <div class="flex items-center justify-between">
        <a href="/" class="-m-1.5 p-1.5">
          <span class="text-xl font-bold text-white">AssetTrackr</span>
        </a>
        <button
          type="button"
          class="-m-2.5 rounded-md p-2.5 text-dark-200 hover:text-white"
          @click="isOpen = false"
        >
          <span class="sr-only">Close menu</span>
          <svg
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="mt-6 flow-root">
        <div class="-my-6 divide-y divide-white/10">
          <div class="space-y-2 py-6">
            <router-link
              v-for="item in navigation"
              :key="item.name"
              :to="item.href"
              :class="[
                isActive(item.href)
                  ? 'shadow-glow-primary bg-primary-800/50 text-white'
                  : 'text-dark-300 hover:bg-white/5 hover:text-white',
                'group flex gap-x-3 rounded-md px-3 py-2 text-base font-medium leading-7 transition-all',
              ]"
            >
              <!-- Home Icon -->
              <svg
                v-if="item.icon === 'HomeIcon'"
                :class="[
                  isActive(item.href)
                    ? 'text-primary-400'
                    : 'text-dark-400 group-hover:text-dark-200',
                  'h-6 w-6 shrink-0',
                ]"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                />
              </svg>

              <!-- Arrows Right Left Icon -->
              <svg
                v-if="item.icon === 'ArrowsRightLeftIcon'"
                :class="[
                  isActive(item.href)
                    ? 'text-primary-400'
                    : 'text-dark-400 group-hover:text-dark-200',
                  'h-6 w-6 shrink-0',
                ]"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                />
              </svg>

              <!-- Clock Icon -->
              <svg
                v-if="item.icon === 'ClockIcon'"
                :class="[
                  isActive(item.href)
                    ? 'text-primary-400'
                    : 'text-dark-400 group-hover:text-dark-200',
                  'h-6 w-6 shrink-0',
                ]"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>

              {{ item.name }}
            </router-link>
          </div>

          <div class="py-6">
            <router-link
              to="/login"
              class="block rounded-md px-3 py-2.5 text-base font-medium leading-7 text-dark-200 hover:bg-white/5 hover:text-white"
            >
              Log out
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.glass-card {
  background-color: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
</style>
