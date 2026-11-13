<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { formatCompactCurrency, formatCurrency } from '@/utils/format'
import type { HistoryPoint } from '@/types'

const props = defineProps<{ points: HistoryPoint[] }>()

const HEIGHT = 260
const PAD = { top: 12, right: 12, bottom: 26, left: 52 }

const container = ref<HTMLElement | null>(null)
const width = ref(640)
let observer: ResizeObserver | undefined

onMounted(() => {
  if (!container.value) return
  width.value = container.value.clientWidth || width.value
  if (typeof ResizeObserver === 'undefined') return
  observer = new ResizeObserver(([entry]) => {
    width.value = entry.contentRect.width || width.value
  })
  observer.observe(container.value)
})
onBeforeUnmount(() => observer?.disconnect())

const plotWidth = computed(() => Math.max(width.value - PAD.left - PAD.right, 10))
const plotHeight = HEIGHT - PAD.top - PAD.bottom

/** A round step (1, 2 or 5 times a power of ten) giving about `count` ticks. */
function niceStep(span: number, count: number) {
  const rough = span / count
  const power = 10 ** Math.floor(Math.log10(rough))
  const unit = rough / power
  if (unit <= 1) return power
  if (unit <= 2) return 2 * power
  if (unit <= 5) return 5 * power
  return 10 * power
}

const scale = computed(() => {
  const values = props.points.flatMap((point) => [point.value, point.costBasis])
  const max = Math.max(...values, 0)
  const min = Math.min(...values, max)
  const span = max - min || max || 1
  const step = niceStep(span * 1.1, 4)
  const lo = Math.max(0, Math.floor((min - span * 0.05) / step) * step)
  const hi = Math.ceil((max + span * 0.05) / step) * step || step
  const ticks: number[] = []
  for (let tick = lo; tick <= hi + step / 2; tick += step) ticks.push(tick)
  return { lo, hi, ticks }
})

const x = (index: number) =>
  PAD.left + (props.points.length > 1 ? (index / (props.points.length - 1)) * plotWidth.value : 0)
const y = (value: number) => {
  const { lo, hi } = scale.value
  return PAD.top + plotHeight - ((value - lo) / (hi - lo)) * plotHeight
}

function path(key: 'value' | 'costBasis') {
  return props.points
    .map((point, index) => `${index ? 'L' : 'M'}${x(index).toFixed(1)},${y(point[key]).toFixed(1)}`)
    .join('')
}
const valuePath = computed(() => path('value'))
const costPath = computed(() => path('costBasis'))
const areaPath = computed(() => {
  if (props.points.length < 2) return ''
  const base = PAD.top + plotHeight
  return `${valuePath.value}L${x(props.points.length - 1).toFixed(1)},${base}L${x(0).toFixed(1)},${base}Z`
})

function dayLabel(date: string, withYear = false) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: withYear ? 'numeric' : undefined,
    timeZone: 'UTC',
  })
}

const xTicks = computed(() => {
  const count = props.points.length
  if (!count) return []
  const wanted = Math.min(count, width.value < 480 ? 3 : 5)
  const indexes = new Set<number>()
  for (let i = 0; i < wanted; i += 1) {
    indexes.add(Math.round((i * (count - 1)) / Math.max(wanted - 1, 1)))
  }
  return [...indexes].map((index) => ({ index, label: dayLabel(props.points[index].date) }))
})

// Hover and keyboard share one "active day"
const active = ref<number | null>(null)
const activePoint = computed(() => (active.value === null ? null : props.points[active.value]))

function handlePointer(event: PointerEvent) {
  const bounds = (event.currentTarget as SVGElement).getBoundingClientRect()
  const ratio = (event.clientX - bounds.left - PAD.left) / plotWidth.value
  const index = Math.round(ratio * (props.points.length - 1))
  active.value = Math.min(Math.max(index, 0), props.points.length - 1)
}

function handleKey(event: KeyboardEvent) {
  const last = props.points.length - 1
  if (event.key === 'ArrowLeft') active.value = Math.max((active.value ?? last) - 1, 0)
  else if (event.key === 'ArrowRight') active.value = Math.min((active.value ?? -1) + 1, last)
  else if (event.key === 'Escape') active.value = null
  else return
  event.preventDefault()
}

const tooltipStyle = computed(() => {
  if (active.value === null) return {}
  const left = x(active.value)
  // Flip to the other side of the crosshair near the right edge
  return left > width.value - 190
    ? { right: `${width.value - left + 12}px` }
    : { left: `${left + 12}px` }
})

const summary = computed(() => {
  const first = props.points[0]
  const last = props.points.at(-1)
  if (!first || !last) return 'No history yet'
  return `Portfolio value from ${dayLabel(first.date, true)} to ${dayLabel(last.date, true)}: ${formatCurrency(first.value)} to ${formatCurrency(last.value)}`
})
</script>

<template>
  <div>
    <div ref="container" class="relative w-full overflow-hidden">
      <svg
        :width="width"
        :height="HEIGHT"
        :viewBox="`0 0 ${width} ${HEIGHT}`"
        role="img"
        :aria-label="summary"
        tabindex="0"
        class="block touch-pan-y select-none rounded focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
        @pointermove="handlePointer"
        @pointerdown="handlePointer"
        @pointerleave="active = null"
        @keydown="handleKey"
        @blur="active = null"
      >
        <defs>
          <linearGradient id="value-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="var(--chart-1)" stop-opacity="0.22" />
            <stop offset="1" stop-color="var(--chart-1)" stop-opacity="0" />
          </linearGradient>
        </defs>

        <g v-for="tick in scale.ticks" :key="tick">
          <line
            :x1="PAD.left"
            :x2="width - PAD.right"
            :y1="y(tick)"
            :y2="y(tick)"
            stroke="var(--chart-grid)"
          />
          <text
            :x="PAD.left - 8"
            :y="y(tick) + 4"
            text-anchor="end"
            fill="var(--chart-axis)"
            font-size="11"
            class="num"
          >
            {{ formatCompactCurrency(tick) }}
          </text>
        </g>
        <text
          v-for="(tick, position) in xTicks"
          :key="tick.index"
          :x="x(tick.index)"
          :y="HEIGHT - 6"
          :text-anchor="
            position === 0 ? 'start' : position === xTicks.length - 1 ? 'end' : 'middle'
          "
          fill="var(--chart-axis)"
          font-size="11"
        >
          {{ tick.label }}
        </text>

        <path :d="areaPath" fill="url(#value-fill)" />
        <path
          :d="costPath"
          fill="none"
          stroke="var(--chart-axis)"
          stroke-width="1.5"
          stroke-dasharray="4 4"
          stroke-linejoin="round"
        />
        <path
          :d="valuePath"
          fill="none"
          stroke="var(--chart-1)"
          stroke-width="2"
          stroke-linejoin="round"
          stroke-linecap="round"
        />

        <g v-if="activePoint && active !== null">
          <line
            :x1="x(active)"
            :x2="x(active)"
            :y1="PAD.top"
            :y2="PAD.top + plotHeight"
            stroke="rgba(255,255,255,0.3)"
          />
          <circle
            :cx="x(active)"
            :cy="y(activePoint.costBasis)"
            r="4"
            fill="var(--chart-axis)"
            stroke="var(--chart-surface)"
            stroke-width="2"
          />
          <circle
            :cx="x(active)"
            :cy="y(activePoint.value)"
            r="5"
            fill="var(--chart-1)"
            stroke="var(--chart-surface)"
            stroke-width="2"
          />
        </g>
      </svg>

      <div
        v-if="activePoint"
        class="bg-dark-800 pointer-events-none absolute top-2 z-10 w-44 rounded-md border border-white/10 px-3 py-2 text-xs shadow-lg"
        :style="tooltipStyle"
      >
        <p class="text-dark-300 mb-1.5">{{ dayLabel(activePoint.date, true) }}</p>
        <p class="flex items-center justify-between gap-3">
          <span class="text-dark-300 flex items-center gap-1.5">
            <span class="inline-block h-0.5 w-3" style="background: var(--chart-1)" />Value
          </span>
          <span class="num font-semibold text-white">{{ formatCurrency(activePoint.value) }}</span>
        </p>
        <p class="mt-1 flex items-center justify-between gap-3">
          <span class="text-dark-300 flex items-center gap-1.5">
            <span
              class="inline-block h-0 w-3 border-t border-dashed"
              style="border-color: var(--chart-axis)"
            />Invested
          </span>
          <span class="num font-semibold text-white">{{
            formatCurrency(activePoint.costBasis)
          }}</span>
        </p>
      </div>
    </div>

    <ul class="text-dark-300 mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs">
      <li class="flex items-center gap-1.5">
        <span class="inline-block h-0.5 w-4" style="background: var(--chart-1)" />Portfolio value
      </li>
      <li class="flex items-center gap-1.5">
        <span
          class="inline-block h-0 w-4 border-t border-dashed"
          style="border-color: var(--chart-axis)"
        />Cost of current holdings
      </li>
    </ul>
  </div>
</template>
