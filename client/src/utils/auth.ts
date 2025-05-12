const TOKEN_KEY = 'token'

export function getStoredAccessToken(storage: Storage): string | null {
  return storage.getItem(TOKEN_KEY)
}

export function clearStoredAccessToken(storage: Storage) {
  storage.removeItem(TOKEN_KEY)
}

export function storeAccessToken(storage: Storage, token: string) {
  storage.setItem(TOKEN_KEY, token)
}

export function getUserFromToken(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1])).user
  } catch (error) {
    console.error('Error parsing token:', error)
    return null
  }
}

export function getUserIdFromToken(token: string) {
  const user = getUserFromToken(token)
  return user ? user.id : null
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const expirationTime = payload.exp * 1000 // Convert to milliseconds
    return Date.now() >= expirationTime
  } catch (error) {
    console.error('Error checking token expiration:', error)
    return true // Treat as expired on parsing error
  }
}

export function getTokenExpirationTime(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 // Convert to milliseconds
  } catch (error) {
    console.error('Error getting token expiration time:', error)
    return null
  }
}

// Structure for future refresh token implementation
export async function refreshToken(): Promise<string | null> {
  // This would be implemented with your backend API
  // For now, just return null to indicate refresh not implemented
  console.warn('Token refresh not implemented yet')
  return null
}
