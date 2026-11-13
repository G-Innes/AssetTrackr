<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Logo from '@/components/Logo.vue'
import { usePortfolioStore } from '@/stores/portfolio'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const portfolioStore = usePortfolioStore()

const menu = ref<HTMLElement | null>(null)
const isOpen = ref(false)

function closeOnOutsideClick(event: MouseEvent) {
  if (menu.value && !menu.value.contains(event.target as Node)) isOpen.value = false
}
onMounted(() => document.addEventListener('click', closeOnOutsideClick))
onBeforeUnmount(() => document.removeEventListener('click', closeOnOutsideClick))

function handleLogout() {
  userStore.logout()
  portfolioStore.reset()
  router.push('/login')
}
</script>

<template>
  <header
    class="bg-canvas/90 sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-white/[0.08] px-4 backdrop-blur sm:px-6 lg:h-16 lg:px-8"
  >
    <router-link to="/dashboard" class="lg:hidden"><Logo /></router-link>

    <div class="ml-auto flex items-center gap-3">
      <span
        v-if="userStore.user?.isDemo"
        class="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-xs font-medium text-amber-200"
        title="A sample account. It is deleted after 24 hours."
      >
        Demo<span class="hidden sm:inline"> account</span>
      </span>

      <div ref="menu" class="relative">
        <button
          type="button"
          class="flex items-center gap-2 rounded-md p-1 text-sm hover:bg-white/5"
          aria-haspopup="menu"
          :aria-expanded="isOpen"
          @click="isOpen = !isOpen"
        >
          <span class="sr-only">Open user menu</span>
          <span
            class="bg-primary-600 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white"
            aria-hidden="true"
          >
            {{ userStore.user?.username.charAt(0).toUpperCase() ?? '' }}
          </span>
          <span class="text-dark-200 hidden font-medium md:block">
            {{ userStore.user?.username }}
          </span>
        </button>

        <div
          v-if="isOpen"
          role="menu"
          class="panel absolute right-0 mt-2 w-48 py-1 shadow-xl"
          @click="isOpen = false"
        >
          <p
            class="text-dark-400 truncate border-b border-white/[0.08] px-4 py-2 text-xs md:hidden"
          >
            {{ userStore.user?.username }}
          </p>
          <router-link
            to="/dashboard/settings"
            role="menuitem"
            class="text-dark-200 block px-4 py-2 text-sm hover:bg-white/5 hover:text-white"
          >
            Settings
          </router-link>
          <button
            type="button"
            role="menuitem"
            class="text-dark-200 block w-full px-4 py-2 text-left text-sm hover:bg-white/5 hover:text-white"
            @click="handleLogout"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
