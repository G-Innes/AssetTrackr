<script setup lang="ts">
import { computed, ref } from 'vue'
import { formatCurrency, formatPercent } from '@/utils/format'
import type { Holding } from '@/types'

const props = defineProps<{ holdings: Holding[] }>()

// Five colours at most: more slices than that cannot be told apart, so the
// smallest holdings are grouped.
const MAX_SLICES = 5
const COLORS = ['--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5']

const RADIUS = 54
const STROKE = 18
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const GAP = 2

interface Slice {
  label: string
  value: number
  share: number
  color: string
}

const slices = computed<Slice[]>(() => {
  const priced = props.holdings
    .filter((holding) => holding.value !== null && holding.value > 0)
    .map((holding) => ({ label: holding.asset.ticker, value: holding.value as number }))
    .sort((a, b) => b.value - a.value)
  const total = priced.reduce((sum, item) => sum + item.value, 0)
  if (!total) return []

  const shown = priced.length > MAX_SLICES ? priced.slice(0, MAX_SLICES - 1) : priced
  const rest = priced.slice(shown.length)
  const result = shown.map((item, index) => ({
    ...item,
    share: (item.value / total) * 100,
    color: `var(${COLORS[index]})`,
  }))
  if (rest.length) {
    const value = rest.reduce((sum, item) => sum + item.value, 0)
    result.push({
      label: `Other (${rest.length})`,
      value,
      share: (value / total) * 100,
      color: 'var(--chart-other)',
    })
  }
  return result
})

const arcs = computed(() => {
  let offset = 0
  return slices.value.map((slice) => {
    const length = (slice.share / 100) * CIRCUMFERENCE
    const gap = slices.value.length > 1 ? GAP : 0
    const arc = {
      ...slice,
      dash: `${Math.max(length - gap, 0.5)} ${CIRCUMFERENCE}`,
      offset: -offset,
    }
    offset += length
    return arc
  })
})

const active = ref<number | null>(null)
const focus = computed(() => (active.value === null ? null : slices.value[active.value]))
</script>

<template>
  <div class="flex flex-col items-center gap-5 sm:flex-row lg:flex-col">
    <div class="relative h-40 w-40 shrink-0">
      <svg viewBox="0 0 144 144" class="h-full w-full -rotate-90" aria-hidden="true">
        <circle
          v-for="(arc, index) in arcs"
          :key="arc.label"
          cx="72"
          cy="72"
          :r="RADIUS"
          fill="none"
          :stroke="arc.color"
          :stroke-width="active === index ? STROKE + 4 : STROKE"
          :stroke-dasharray="arc.dash"
          :stroke-dashoffset="arc.offset"
          :opacity="active === null || active === index ? 1 : 0.35"
          class="transition-all duration-150"
          @pointerenter="active = index"
          @pointerleave="active = null"
        />
      </svg>
      <div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <template v-if="focus">
          <span class="text-dark-300 text-xs">{{ focus.label }}</span>
          <span class="text-lg font-semibold text-white">{{
            formatPercent(focus.share, false)
          }}</span>
        </template>
        <template v-else>
          <span class="text-lg font-semibold text-white">{{ holdings.length }}</span>
          <span class="text-dark-300 text-xs">{{
            holdings.length === 1 ? 'asset' : 'assets'
          }}</span>
        </template>
      </div>
    </div>

    <ul class="w-full min-w-0 space-y-1 text-sm">
      <li
        v-for="(slice, index) in slices"
        :key="slice.label"
        tabindex="0"
        class="flex items-center gap-2 rounded px-2 py-1 focus:outline-none"
        :class="active === index ? 'bg-white/5' : ''"
        @pointerenter="active = index"
        @pointerleave="active = null"
        @focus="active = index"
        @blur="active = null"
      >
        <span class="h-2.5 w-2.5 shrink-0 rounded-sm" :style="{ background: slice.color }" />
        <span class="truncate font-medium text-white">{{ slice.label }}</span>
        <span class="text-dark-300 num ml-auto">{{ formatCurrency(slice.value) }}</span>
        <span class="num w-14 text-right text-white">{{ formatPercent(slice.share, false) }}</span>
      </li>
    </ul>
  </div>
</template>
