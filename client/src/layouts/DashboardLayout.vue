<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import Sidebar from '@/components/dashboard/Sidebar.vue'
import Header from '@/components/dashboard/Header.vue'
import { useUserStore } from '@/stores/user'

// After a page reload only the token survives; fetch the profile again.
onMounted(() => useUserStore().restoreSession())
</script>

<template>
  <div class="min-h-screen">
    <Sidebar />
    <div class="lg:pl-60">
      <Header />
      <!-- Bottom padding leaves room for the mobile tab bar -->
      <main class="px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-12 lg:pt-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>
