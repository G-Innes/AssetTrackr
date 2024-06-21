<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { FwbNavbar, FwbNavbarCollapse } from 'flowbite-vue'

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
</script>

<template>
  <FwbNavbar class="memphis-header">
    <template #default="{ isShowMenu }">
      <FwbNavbar-collapse :isShowMenu="isShowMenu">
        <!-- prettier-ignore -->
        <router-link
          v-for="link in links"
          :key="link.name"
          :to="link.to"
          :exact="true"
          class="nav-link"
        >
          {{ link.label }}
        </router-link>
        <slot name="menu" />
      </FwbNavbar-collapse>
    </template>
  </FwbNavbar>

  <main>
    <div class="container mx-auto px-6 py-8">
      <RouterView />
    </div>
  </main>
</template>

<style scoped>

.memphis-header {
  background-color: #CCCCCC;

  box-shadow: 0 4px 0 #121212;
  padding: 0.5rem 1rem;
}

.memphis-header .fwb-navbar-link {
  font-weight: bold;
  text-decoration: none;
  padding: 0.5rem 1rem;
}

.memphis-header .fwb-navbar-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 0.25rem;
  color: #1A5138;
}

</style>
