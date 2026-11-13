import axios from 'axios'
import { clearToken, getToken } from '@/utils/auth'
import type { Holding, NewTransaction, Transaction, TransactionType, User } from '@/types'

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

  async getHoldings() {
    return (await client.get<Holding[]>('/api/holdings')).data
  },

  async getTransactions(filters: { type?: TransactionType; assetId?: number } = {}) {
    return (await client.get<Transaction[]>('/api/transactions', { params: filters })).data
  },

  async createTransaction(input: NewTransaction) {
    return (await client.post<Transaction>('/api/transactions', input)).data
  },
}
