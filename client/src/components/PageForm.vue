<script lang="ts" setup>
defineProps<{
  heading: string
  formLabel: string
}>()

defineEmits<{
  submit: []
}>()
</script>

<template>
  <div class="flex min-h-screen items-center justify-center">
    <div class="memphis-container max-w-md p-6">
      <h2 class="memphis-title">{{ heading }}</h2>

      <div class="memphis-card memphis-square mt-6">
        <form class="space-y-6" :aria-label="formLabel" @submit.prevent="$emit('submit')">
          <slot />
        </form>

        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.memphis-container {
  width: 100%;
}

.memphis-card {
  background-color: #cccccc;
  color: #121212;
  box-shadow: 10px 10px 0 #121212;
  border-radius: 10px;
  transition: transform 0.2s;
  display: flex;
  flex-direction: column;
  padding: 2rem;
}

.memphis-title {
  font-size: 24px;
  font-weight: bold;
  color: #121212;
  margin-bottom: 1rem;
}

.memphis-square {
  grid-column: span 1;
  grid-row: span 1;
}

@media (max-width: 767px) {
  .memphis-container {
    max-width: 100%;
  }
}
</style>
