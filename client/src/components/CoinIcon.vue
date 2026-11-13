<script setup lang="ts">
import { computed } from 'vue'

/**
 * A small coloured badge for an asset. Drawn rather than downloaded: there
 * are hundreds of tradable assets and no logo set that covers them all.
 */
const props = defineProps<{ ticker: string }>()

// Familiar colours for the coins most people hold; the rest get a stable
// hue worked out from their ticker.
const KNOWN: Record<string, number> = {
  BTC: 33,
  ETH: 228,
  SOL: 268,
  DOGE: 48,
  LINK: 222,
  ADA: 215,
  XRP: 200,
  USDC: 210,
  LTC: 220,
  DOT: 328,
  AVAX: 0,
}

const hue = computed(() => {
  if (props.ticker in KNOWN) return KNOWN[props.ticker]
  let hash = 0
  for (const char of props.ticker) hash = (hash * 31 + char.charCodeAt(0)) % 360
  return hash
})

const label = computed(() => (props.ticker.length <= 4 ? props.ticker : props.ticker.slice(0, 1)))
</script>

<template>
  <span
    class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold tracking-tight"
    :class="label.length > 3 ? 'text-[8px]' : label.length > 1 ? 'text-[10px]' : 'text-sm'"
    :style="{ background: `hsl(${hue} 55% 20%)`, color: `hsl(${hue} 85% 78%)` }"
    aria-hidden="true"
  >
    {{ label }}
  </span>
</template>
