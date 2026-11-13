import axios from 'axios'
import { clearToken, getToken } from '@/utils/auth'
import type {
  HistoryPoint,
  HistoryRange,
  MarketAsset,
  NewTransaction,
  Portfolio,
  Transaction,
  TransactionChanges,
  TransactionType,
  User,
} from '@/types'

const client = axios.create({
  // Empty in development, where Vite proxies /api to the local server.
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 15000,
})

client.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let onSessionExpired: () => void = () => {}

/** Lets the app decide what happens when the server rejects our token. */
export function setSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler
}

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute = error.config?.url?.startsWith('/api/auth/')
    if (error.response?.status === 401 && !isAuthRoute) {
      clearToken()
      onSessionExpired()
    }
    return Promise.reject(error)
  }
)

/** The message to show a person for any failed request. */
export function getErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
) {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.message) return String(error.response.data.message)
    if (!error.response) return 'Cannot reach the server. Check your connection and try again.'
  }
  return fallback
}

interface AuthResponse {
  user: User
  token: string
}

export const api = {
  async signup(input: { username: string; email: string; password: string }) {
    return (await client.post<AuthResponse>('/api/auth/signup', input)).data
  },

  async login(input: { usernameOrEmail: string; password: string }) {
    return (await client.post<AuthResponse>('/api/auth/login', input)).data
  },

  async getMe() {
    return (await client.get<User>('/api/me')).data
  },

  /** Creates a throwaway account that already holds a sample portfolio. */
  async startDemo() {
    return (await client.post<AuthResponse>('/api/auth/demo')).data
  },

  async updateMe(changes: { username?: string; email?: string }) {
    return (await client.patch<User>('/api/me', changes)).data
  },

  async changePassword(input: { currentPassword: string; newPassword: string }) {
    await client.put('/api/me/password', input)
  },

  async deleteMe() {
    await client.delete('/api/me')
  },

  async getPortfolio() {
    return (await client.get<Portfolio>('/api/portfolio')).data
  },

  async getPortfolioHistory(range: HistoryRange) {
    const { data } = await client.get<{ points: HistoryPoint[] }>('/api/portfolio/history', {
      params: { range },
    })
    return data.points
  },

  /** Deletes an asset and all of its transactions from the user's portfolio. */
  async removeAsset(assetId: number) {
    await client.delete(`/api/portfolio/assets/${assetId}`)
  },

  async searchAssets(query: string, limit = 8) {
    return (await client.get<MarketAsset[]>('/api/market/assets', { params: { q: query, limit } }))
      .data
  },

  /** The live price, or the closing price on `date` (YYYY-MM-DD). Null when there is none. */
  async getPrice(ticker: string, date?: string): Promise<number | null> {
    try {
      const { data } = await client.get<{ price: number }>(
        `/api/market/assets/${encodeURIComponent(ticker)}/price`,
        { params: date ? { date } : {} }
      )
      return data.price
    } catch {
      return null
    }
  },

  async getTransactions(filters: { type?: TransactionType; assetId?: number } = {}) {
    return (await client.get<Transaction[]>('/api/transactions', { params: filters })).data
  },

  async createTransaction(input: NewTransaction) {
    return (await client.post<Transaction>('/api/transactions', input)).data
  },

  async updateTransaction(id: number, changes: TransactionChanges) {
    return (await client.patch<Transaction>(`/api/transactions/${id}`, changes)).data
  },

  async deleteTransaction(id: number) {
    await client.delete(`/api/transactions/${id}`)
  },
}
