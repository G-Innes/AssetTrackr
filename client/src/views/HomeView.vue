<script lang="ts" setup>
import { RouterLink } from 'vue-router'
import DemoButton from '@/components/DemoButton.vue'
import Logo from '@/components/Logo.vue'

const features = [
  {
    title: 'Profit you can check',
    text: 'Every holding shows its average cost, what it is worth now and the gain or loss. Profit you have already taken by selling is kept separate from profit that is still on paper.',
  },
  {
    title: 'A ledger, not a balance',
    text: 'Record trades on the day they happened, fix a typo, delete a mistake. Holdings are always worked out from the full history, so the numbers cannot drift.',
  },
  {
    title: 'Live and historical prices',
    text: 'Search every asset Coinbase prices in dollars. Backdate a trade and its price is filled in from that day’s close.',
  },
]

const stack = [
  ['Client', 'Vue 3, TypeScript, Pinia, Tailwind CSS, hand-built SVG charts'],
  ['API', 'Express, TypeORM, PostgreSQL, zod validation, JWT auth'],
  ['Money', 'Exact decimal arithmetic end to end: no floating-point balances'],
  [
    'Quality',
    'Vitest and Supertest against a real database, Playwright end to end, CI on every push',
  ],
]
</script>

<template>
  <div class="mx-auto max-w-6xl px-5 sm:px-8">
    <header class="flex h-16 items-center justify-between">
      <Logo />
      <nav class="flex items-center gap-2" aria-label="Account">
        <RouterLink to="/login" class="btn text-dark-200 hover:text-white">Log in</RouterLink>
        <RouterLink to="/signup" class="btn-quiet">Sign up</RouterLink>
      </nav>
    </header>

    <main>
      <section class="pb-12 pt-14 text-center sm:pt-20">
        <h1
          class="font-display mx-auto max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-6xl"
        >
          Know what your crypto is <span class="text-primary-500">actually</span> worth.
        </h1>
        <p class="text-dark-300 mx-auto mt-6 max-w-2xl text-lg leading-8">
          AssetTrackr turns a simple record of your buys and sells into cost basis, profit and loss,
          and a history of your portfolio’s value, priced live from Coinbase.
        </p>
        <div class="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <div><DemoButton class="btn-primary px-5 py-2.5 text-base" /></div>
          <RouterLink to="/signup" class="btn-quiet px-5 py-2.5 text-base">
            Create an account
          </RouterLink>
        </div>
        <p class="text-dark-500 mt-3 text-sm">
          The demo opens a sample portfolio straight away. No sign-up.
        </p>
      </section>

      <div class="panel overflow-hidden shadow-2xl shadow-black/50">
        <img
          src="/preview-dashboard.png"
          alt="The AssetTrackr dashboard: total portfolio value with a chart of its history, profit figures, an allocation breakdown and a table of holdings."
          width="2400"
          height="1500"
          class="block h-auto w-full"
        />
      </div>

      <section class="grid gap-10 py-20 md:grid-cols-3" aria-label="Features">
        <div v-for="feature in features" :key="feature.title">
          <h2 class="text-base font-semibold text-white">{{ feature.title }}</h2>
          <p class="text-dark-300 mt-2 text-sm leading-6">{{ feature.text }}</p>
        </div>
      </section>

      <section class="border-t border-white/[0.08] py-16" aria-labelledby="built-heading">
        <div class="grid gap-8 md:grid-cols-3">
          <div>
            <h2 id="built-heading" class="font-display text-xl font-bold text-white">
              How it is built
            </h2>
            <p class="text-dark-300 mt-2 text-sm leading-6">
              A full-stack TypeScript project. The source, tests and design notes are on GitHub.
            </p>
            <a
              href="https://github.com/G-Innes/AssetTrackr"
              class="text-primary-400 hover:text-primary-300 mt-4 inline-block text-sm font-medium"
              rel="noopener"
            >
              View the source →
            </a>
          </div>
          <dl class="space-y-4 md:col-span-2">
            <div v-for="[name, detail] in stack" :key="name" class="flex gap-4 text-sm">
              <dt class="text-dark-400 w-16 shrink-0">{{ name }}</dt>
              <dd class="text-dark-100">{{ detail }}</dd>
            </div>
          </dl>
        </div>
      </section>
    </main>

    <footer class="text-dark-500 border-t border-white/[0.08] py-6 text-xs">
      A portfolio project. Prices are indicative and nothing here is financial advice.
    </footer>
  </div>
</template>
