<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Navigation links
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: 'HomeIcon' },
  { name: 'Buy or Sell', href: '/dashboard/asset-manage', icon: 'ArrowsRightLeftIcon' },
  { name: 'My Transactions', href: '/dashboard/transactions', icon: 'ClockIcon' },
]

// Helper to check if a route is active
const isActive = (href: string) => {
  return route.path === href || route.path.startsWith(`${href}/`)
}
</script>

<template>
  <!-- Sidebar for desktop -->
  <div class="hidden lg:fixed lg:inset-y-0 lg:z-10 lg:flex lg:w-72 lg:flex-col">
    <div class="glass-card flex grow flex-col gap-y-5 overflow-y-auto border-r border-white/10 bg-glass-gradient px-6 py-4 backdrop-blur-md">
      <div class="flex h-16 shrink-0 items-center">
        <router-link to="/" class="flex items-center">
          <span class="text-xl font-bold text-white">AssetTrackr</span>
        </router-link>
      </div>
      
      <nav class="flex flex-1 flex-col">
        <ul role="list" class="flex flex-1 flex-col gap-y-2">
          <li v-for="item in navigation" :key="item.name">
            <router-link 
              :to="item.href" 
              :class="[
                isActive(item.href) 
                  ? 'bg-primary-800/50 text-white shadow-glow-primary' 
                  : 'text-dark-300 hover:bg-white/5 hover:text-white',
                'group flex gap-x-3 rounded-md p-3 text-sm font-medium transition-all duration-200'
              ]"
            >
              <!-- Home Icon -->
              <svg 
                v-if="item.icon === 'HomeIcon'" 
                :class="[
                  isActive(item.href) ? 'text-primary-400' : 'text-dark-400 group-hover:text-dark-200',
                  'h-5 w-5 shrink-0'
                ]"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke-width="1.5" 
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              
              <!-- Arrows Right Left Icon -->
              <svg 
                v-if="item.icon === 'ArrowsRightLeftIcon'" 
                :class="[
                  isActive(item.href) ? 'text-primary-400' : 'text-dark-400 group-hover:text-dark-200',
                  'h-5 w-5 shrink-0'
                ]"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke-width="1.5" 
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
              
              <!-- Clock Icon -->
              <svg 
                v-if="item.icon === 'ClockIcon'" 
                :class="[
                  isActive(item.href) ? 'text-primary-400' : 'text-dark-400 group-hover:text-dark-200',
                  'h-5 w-5 shrink-0'
                ]"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke-width="1.5" 
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              
              <span>{{ item.name }}</span>
            </router-link>
          </li>
        </ul>
      </nav>
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