<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

defineProps<{ title: string }>()
const emit = defineEmits<{ close: [] }>()

const panel = ref<HTMLElement | null>(null)
let previouslyFocused: Element | null = null

function handleKey(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}

onMounted(async () => {
  previouslyFocused = document.activeElement
  document.addEventListener('keydown', handleKey)
  await nextTick()
  panel.value?.focus()
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKey)
  if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
})
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4"
      @mousedown.self="emit('close')"
    >
      <div
        ref="panel"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        tabindex="-1"
        class="panel max-h-[92vh] w-full overflow-y-auto rounded-b-none p-5 shadow-2xl focus:outline-none sm:max-w-lg sm:rounded-b-xl sm:p-6"
      >
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-white">{{ title }}</h2>
          <button
            type="button"
            class="text-dark-400 -mr-1 rounded p-1 hover:bg-white/5 hover:text-white"
            aria-label="Close"
            @click="emit('close')"
          >
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor">
              <path stroke-width="1.8" stroke-linecap="round" d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>
        <slot />
      </div>
    </div>
  </Teleport>
</template>
