import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { api } from '@/services/api'
import { clearToken, hasValidToken, storeToken } from '@/utils/auth'
import type { User } from '@/types'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => user.value !== null)

  function startSession(session: { user: User; token: string }) {
    storeToken(session.token)
    user.value = session.user
  }

  async function login(usernameOrEmail: string, password: string) {
    startSession(await api.login({ usernameOrEmail, password }))
  }

  async function signup(input: { username: string; email: string; password: string }) {
    startSession(await api.signup(input))
  }

  async function startDemo() {
    startSession(await api.startDemo())
  }

  /** Loads the profile for a token left over from an earlier visit. */
  async function restoreSession() {
    if (user.value || !hasValidToken()) return
    try {
      user.value = await api.getMe()
    } catch {
      // A rejected token has already been cleared by the API layer.
    }
  }

  function logout() {
    clearToken()
    user.value = null
  }

  function setUser(next: User) {
    user.value = next
  }

  return { user, isAuthenticated, login, signup, startDemo, restoreSession, setUser, logout }
})
