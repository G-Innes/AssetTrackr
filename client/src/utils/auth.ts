const TOKEN_KEY = 'token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function storeToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  // Older versions cached the profile here; make sure it does not linger.
  localStorage.removeItem('user')
}

/** Reads the expiry out of the token. The server remains the real judge. */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return typeof payload.exp !== 'number' || Date.now() >= payload.exp * 1000
  } catch {
    return true
  }
}

/** True when there is a token that has not expired yet. */
export function hasValidToken(): boolean {
  const token = getToken()
  if (!token) return false
  if (isTokenExpired(token)) {
    clearToken()
    return false
  }
  return true
}
