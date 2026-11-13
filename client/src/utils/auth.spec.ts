import { beforeEach, describe, expect, it } from 'vitest'
import { clearToken, getToken, hasValidToken, isTokenExpired, storeToken } from './auth'

/** Builds an unsigned token with the given payload; only the client-side parsing is under test. */
function tokenWith(payload: object): string {
  const encode = (value: object) =>
    btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return `${encode({ alg: 'HS256' })}.${encode(payload)}.signature`
}

const nowInSeconds = () => Math.floor(Date.now() / 1000)

beforeEach(() => localStorage.clear())

describe('isTokenExpired', () => {
  it('accepts a token that expires in the future', () => {
    expect(isTokenExpired(tokenWith({ sub: '1', exp: nowInSeconds() + 60 }))).toBe(false)
  })

  it('rejects a token whose expiry has passed', () => {
    expect(isTokenExpired(tokenWith({ sub: '1', exp: nowInSeconds() - 1 }))).toBe(true)
  })

  it('treats anything unreadable as expired', () => {
    expect(isTokenExpired('garbage')).toBe(true)
    expect(isTokenExpired(tokenWith({ sub: '1' }))).toBe(true)
  })
})

describe('hasValidToken', () => {
  it('is false when nothing is stored', () => {
    expect(hasValidToken()).toBe(false)
  })

  it('is true for a stored, unexpired token', () => {
    storeToken(tokenWith({ exp: nowInSeconds() + 60 }))

    expect(hasValidToken()).toBe(true)
  })

  it('removes an expired token so it is not sent again', () => {
    storeToken(tokenWith({ exp: nowInSeconds() - 60 }))

    expect(hasValidToken()).toBe(false)
    expect(getToken()).toBeNull()
  })
})

describe('clearToken', () => {
  it('also removes the profile older versions cached', () => {
    storeToken('abc')
    localStorage.setItem('user', '{"password":"hash"}')

    clearToken()

    expect(getToken()).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })
})
