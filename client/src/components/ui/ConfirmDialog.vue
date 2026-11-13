<script setup lang="ts">
import Modal from './Modal.vue'

defineProps<{
  title: string
  confirmLabel: string
  /** Shown when the action was refused, e.g. by the server */
  error?: string
  isWorking?: boolean
}>()
const emit = defineEmits<{ confirm: []; close: [] }>()
</script>

<template>
  <Modal :title="title" @close="emit('close')">
    <div class="text-dark-200 text-sm"><slot /></div>
    <p
      v-if="error"
      role="alert"
      class="border-danger-500/30 bg-danger-600/10 text-danger-200 mt-4 rounded-md border px-3 py-2 text-sm"
    >
      {{ error }}
    </p>
    <div class="mt-6 flex justify-end gap-2">
      <button type="button" class="btn-quiet" @click="emit('close')">Cancel</button>
      <button type="button" class="btn-danger" :disabled="isWorking" @click="emit('confirm')">
        {{ confirmLabel }}
      </button>
    </div>
  </Modal>
</template>
