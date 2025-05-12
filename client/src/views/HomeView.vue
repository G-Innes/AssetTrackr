<script lang="ts" setup>
import { RouterLink } from 'vue-router'
</script>

<template>

  
  <!-- Hero Section -->
  <div class="relative overflow-hidden">
    <header class="fixed top-0 z-10 w-full backdrop-blur-sm">
      <div class="glass-card border-b border-white/10 px-6 py-4">
        <div class="mx-auto flex items-center justify-between">
          <div class="text-xl font-bold text-white">AssetTrackr</div>
          <div class="flex items-center gap-4">
            <RouterLink
              to="/login"
              class="rounded-md bg-transparent backdrop-blur-sm border border-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/10"
            >
              Log in
            </RouterLink>
            <RouterLink
              to="/signup"
              class="rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white shadow-glow-primary hover:bg-primary-500"
            >
              Sign up
            </RouterLink>
          </div>
        </div>
      </div>
    </header>
    
    <div class="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:gap-x-10 lg:px-8 lg:py-40">
      <div class="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
        <h1 class="mt-10 max-w-lg text-4xl font-display font-bold tracking-tight text-white sm:text-6xl">
          Manage your crypto portfolio with ease
        </h1>
        <p class="mt-6 text-lg leading-8 text-dark-300">
          AssetTrackr helps you track your cryptocurrency investments in real-time. Log buy and sell transactions, 
          view live prices from Coinbase, and analyze your portfolio's performance.
        </p>
        <div class="mt-10 flex items-center gap-x-6">
          <RouterLink
            to="/signup"
            class="rounded-md bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-glow-primary hover:bg-primary-500"
          >
            Get started
          </RouterLink>
          <RouterLink
            to="/login"
            class="rounded-md px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/20 hover:bg-white/5"
          >
            Log in
          </RouterLink>
        </div>
      </div>
      <div class="mt-16 sm:mt-24 lg:mt-0 lg:flex-shrink-0 lg:flex-grow">
        <div class="glass-card relative mx-auto overflow-hidden rounded-xl border border-white/10 shadow-glow-white sm:max-w-lg lg:w-[450px]">
          <div class="p-4 pt-8 sm:p-10">
            <div class="mb-10 border-b border-white/10 pb-6">
              <h2 class="text-2xl font-bold text-primary-500">AssetTrackr</h2>
              <p class="mt-2 text-sm text-dark-400">Your personal cryptocurrency portfolio tracker</p>
            </div>
            
            <!-- Sample portfolio display -->
            <div class="space-y-6 font-mono text-sm">
              <div class="glass-card rounded-lg p-4">
                <div class="mb-2 text-xs font-medium text-dark-400">Portfolio Value</div>
                <div class="text-2xl font-bold text-white">$143,721.65</div>
                <div class="mt-1 text-xs text-success-500">+12.4% (30d)</div>
              </div>
              
              <div class="space-y-3">
                <div class="glass-card flex items-center justify-between rounded-lg p-3">
                  <div class="flex items-center">
                    <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500/20 text-primary-400 font-bold ring-1 ring-primary-500/30">
                      BTC
                    </div>
                    <div class="ml-3">
                      <div class="font-medium text-white">Bitcoin</div>
                      <div class="text-xs text-dark-400">12.45 BTC</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="font-medium text-white">$97,253.20</div>
                    <div class="text-xs text-success-500">+5.3%</div>
                  </div>
                </div>
                
                <div class="glass-card flex items-center justify-between rounded-lg p-3">
                  <div class="flex items-center">
                    <div class="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-500/20 text-secondary-400 font-bold ring-1 ring-secondary-500/30">
                      ETH
                    </div>
                    <div class="ml-3">
                      <div class="font-medium text-white">Ethereum</div>
                      <div class="text-xs text-dark-400">24.8 ETH</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="font-medium text-white">$46,468.45</div>
                    <div class="text-xs text-success-500">+8.7%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Features Section -->
  <div class="py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="mx-auto max-w-2xl lg:text-center">
        <h2 class="text-base font-semibold leading-7 text-primary-400">Track Effectively</h2>
        <p class="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Everything you need to manage your crypto assets
        </p>
        <p class="mt-6 text-lg leading-8 text-dark-300">
          AssetTrackr provides a comprehensive suite of tools to help you manage your cryptocurrency investments with confidence.
        </p>
      </div>
      <div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
        <dl class="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
          <div class="glass-card rounded-xl border border-white/10 p-6 shadow-glow-primary">
            <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
              <svg class="h-5 w-5 flex-none text-primary-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M5.5 17a4.5 4.5 0 01-1.44-8.765 4.5 4.5 0 018.302-3.046 3.5 3.5 0 014.504 4.272A4 4 0 0115 17H5.5zm3.75-2.75a.75.75 0 001.5 0V9.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0l-3.25 3.5a.75.75 0 101.1 1.02l1.95-2.1v4.59z" clip-rule="evenodd" />
              </svg>
              Real-time Price Updates
            </dt>
            <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-dark-300">
              <p class="flex-auto">
                Get the latest cryptocurrency prices directly from Coinbase API, ensuring you always have accurate data for your portfolio.
              </p>
            </dd>
          </div>
          <div class="glass-card rounded-xl border border-white/10 p-6 shadow-glow-secondary">
            <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
              <svg class="h-5 w-5 flex-none text-secondary-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clip-rule="evenodd" />
              </svg>
              Secure Authentication
            </dt>
            <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-dark-300">
              <p class="flex-auto">
                Your portfolio data is protected with secure authentication and authorization, giving you peace of mind.
              </p>
            </dd>
          </div>
          <div class="glass-card rounded-xl border border-white/10 p-6 shadow-glow-purple">
            <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
              <svg class="h-5 w-5 flex-none text-purple-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M10 3.75a2 2 0 10-4 0 2 2 0 004 0zM17.25 4.5a.75.75 0 000-1.5h-5.5a.75.75 0 000 1.5h5.5zM5 3.75a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 01.75.75zM4.25 17a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5h1.5zM17.25 17a.75.75 0 000-1.5h-5.5a.75.75 0 000 1.5h5.5zM9 10a.75.75 0 01-.75.75h-5.5a.75.75 0 010-1.5h5.5A.75.75 0 019 10zM17.25 10.75a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5h1.5zM14 10a2 2 0 10-4 0 2 2 0 004 0zM10 16.25a2 2 0 10-4 0 2 2 0 004 0z" />
              </svg>
              Transaction History
            </dt>
            <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-dark-300">
              <p class="flex-auto">
                Keep track of all your buy and sell transactions with a comprehensive history view and filtering options.
              </p>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </div>

  <!-- CTA Section -->
  <div class="glass-card border-t border-white/10">
    <div class="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
      <div class="mx-auto max-w-2xl text-center">
        <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Start tracking your crypto assets today
        </h2>
        <p class="mx-auto mt-6 max-w-xl text-lg leading-8 text-dark-300">
          Join thousands of users who trust AssetTrackr to manage their cryptocurrency portfolios.
        </p>
        <div class="mt-10 flex items-center justify-center gap-x-6">
          <RouterLink
            to="/signup"
            class="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-glow-primary hover:bg-primary-500"
          >
            Get started
          </RouterLink>
          <RouterLink to="/login" class="text-sm font-semibold leading-6 text-dark-200 hover:text-white">
            Login <span aria-hidden="true">→</span>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.glass-card {
  background-color: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
</style>
