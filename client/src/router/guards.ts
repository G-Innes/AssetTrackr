// src/guards.ts
import { isLoggedIn } from '../services/apiService'
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

export function authenticate(
  _to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  if (isLoggedIn()) {
    next()
  } else {
    next({ name: 'Login' })
  }
}
