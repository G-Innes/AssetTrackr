<script setup lang="ts">
import { computed } from 'vue'
import { formatPercent, formatSignedCurrency } from '@/utils/format'

/** A gain or loss: coloured, but also signed and arrowed so colour is never the only cue. */
const props = defineProps<{
  amount?: number | null
  percent?: number | null
}>()

const direction = computed(() => {
  const basis = props.amount ?? props.percent ?? 0
  return basis > 0 ? 'up' : basis < 0 ? 'down' : 'flat'
})

const text = computed(() => {
  const parts: string[] = []
  if (props.amount !== undefined) parts.push(formatSignedCurrency(props.amount))
  if (props.percent !== undefined && props.percent !== null) {
    const percent = formatPercent(props.percent)
    parts.push(props.amount !== undefined ? `(${percent})` : percent)
  }
  return parts.join(' ') || '-'
})
</script>

<template>
  <span
    class="num inline-flex items-center gap-1 whitespace-nowrap"
    :class="{
      'text-success-400': direction === 'up',
      'text-danger-400': direction === 'down',
      'text-dark-300': direction === 'flat',
    }"
  >
    <svg
      v-if="direction !== 'flat'"
      class="h-2.5 w-2.5 shrink-0"
      :class="direction === 'down' ? 'rotate-180' : ''"
      viewBox="0 0 10 10"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M5 1l4.5 8h-9z" />
    </svg>
    {{ text }}
  </span>
</template>
