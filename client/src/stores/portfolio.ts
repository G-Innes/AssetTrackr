import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/services/api'
import type { HistoryPoint, HistoryRange, Portfolio } from '@/types'

export const usePortfolioStore = defineStore('portfolio', () => {
  const portfolio = ref<Portfolio | null>(null)
  const history = ref<HistoryPoint[]>([])
  const range = ref<HistoryRange>('90d')
  const isLoading = ref(false)
  const isLoadingHistory = ref(false)
  const error = ref('')

  async function loadHistory() {
    isLoadingHistory.value = true
    try {
      history.value = await api.getPortfolioHistory(range.value)
    } catch {
      // The chart is a nice-to-have: the holdings below it still tell the story.
      history.value = []
    } finally {
      isLoadingHistory.value = false
    }
  }

  async function load() {
    isLoading.value = true
    error.value = ''
    try {
      const [summary] = await Promise.all([api.getPortfolio(), loadHistory()])
      portfolio.value = summary
    } catch {
      error.value = 'Could not load your portfolio. Please try again.'
    } finally {
      isLoading.value = false
    }
  }

  async function setRange(next: HistoryRange) {
    if (next === range.value) return
    range.value = next
    await loadHistory()
  }

  function reset() {
    portfolio.value = null
    history.value = []
    range.value = '90d'
    error.value = ''
  }

  return { portfolio, history, range, isLoading, isLoadingHistory, error, load, setRange, reset }
})
