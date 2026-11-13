<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import MobileMenu from '@/components/dashboard/MobileMenu.vue'
import Sidebar from '@/components/dashboard/Sidebar.vue'
import Header from '@/components/dashboard/Header.vue'
import { useUserStore } from '@/stores/user'

// After a page reload only the token survives; fetch the profile again.
onMounted(() => useUserStore().restoreSession())
</script>

<template>
  <div class="relative min-h-screen overflow-hidden">
    <!-- Mobile Navigation Drawer -->
    <MobileMenu />

    <!-- Desktop Sidebar -->
    <Sidebar />

    <!-- Main Content Area -->
    <div class="flex flex-col lg:pl-72">
      <!-- Top Navigation -->
      <Header />

      <!-- Page Content -->
      <main class="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>
