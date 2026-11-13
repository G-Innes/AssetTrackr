<script setup lang="ts">
import { useRoute } from 'vue-router'
import Logo from '@/components/Logo.vue'
import { navigation } from './navigation'

const route = useRoute()
// Every link is a sibling page, so only an exact match is the active one
const isActive = (href: string) => route.path === href
</script>

<template>
  <!-- Desktop: a fixed column on the left -->
  <aside
    class="bg-surface hidden border-r border-white/[0.08] lg:fixed lg:inset-y-0 lg:flex lg:w-60 lg:flex-col"
  >
    <router-link to="/dashboard" class="flex h-16 items-center px-5">
      <Logo />
    </router-link>
    <nav class="flex-1 px-3 py-2" aria-label="Main">
      <ul class="space-y-1">
        <li v-for="item in navigation" :key="item.href">
          <router-link
            :to="item.href"
            :aria-current="isActive(item.href) ? 'page' : undefined"
            class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors"
            :class="
              isActive(item.href)
                ? 'bg-white/[0.07] text-white'
                : 'text-dark-400 hover:bg-white/[0.04] hover:text-white'
            "
          >
            <svg
              class="h-[18px] w-[18px] shrink-0"
              :class="isActive(item.href) ? 'text-primary-400' : ''"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path :d="item.icon" />
            </svg>
            {{ item.name }}
          </router-link>
        </li>
      </ul>
    </nav>
    <p class="text-dark-500 px-5 py-4 text-xs">Prices from Coinbase</p>
  </aside>

  <!-- Mobile: a tab bar along the bottom, within thumb reach -->
  <nav
    class="bg-surface fixed inset-x-0 bottom-0 z-30 border-t border-white/[0.08] pb-[env(safe-area-inset-bottom)] lg:hidden"
    aria-label="Main"
  >
    <ul class="grid grid-cols-4">
      <li v-for="item in navigation" :key="item.href">
        <router-link
          :to="item.href"
          :aria-current="isActive(item.href) ? 'page' : undefined"
          class="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium"
          :class="isActive(item.href) ? 'text-primary-400' : 'text-dark-400'"
        >
          <svg
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path :d="item.icon" />
          </svg>
          {{ item.short }}
        </router-link>
      </li>
    </ul>
  </nav>
</template>
