import type { NavigationGuard } from 'vue-router'
import { hasValidToken } from '@/utils/auth'

/** Sends visitors without a usable token to the login page. */
export const authenticate: NavigationGuard = (to) => {
  if (hasValidToken()) return true
  return { name: 'Login', query: { redirect: to.fullPath } }
}

/** Keeps signed-in users out of the login and signup pages. */
export const redirectIfAuthenticated: NavigationGuard = () => {
  return hasValidToken() ? { name: 'Dashboard' } : true
}
