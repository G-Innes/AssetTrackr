import { describe, expect, it } from 'vitest'
import { formatCurrency, formatDate, formatQuantity } from './format'

describe('formatCurrency', () => {
  it('formats ordinary amounts with two decimals', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50')
    expect(formatCurrency('60000.55')).toBe('$60,000.55')
    expect(formatCurrency(0)).toBe('$0.00')
  })

  it('keeps sub-dollar prices readable instead of rounding them to $0.00', () => {
    expect(formatCurrency(0.06441)).toBe('$0.06441')
    expect(formatCurrency(0.00001234)).toBe('$0.00001234')
  })

  it('handles negative and missing values', () => {
    expect(formatCurrency(-12.3)).toBe('-$12.30')
    expect(formatCurrency(null)).toBe('$0.00')
    expect(formatCurrency('abc')).toBe('-')
  })
})

describe('formatQuantity', () => {
  it('drops trailing zeros and groups thousands', () => {
    expect(formatQuantity('0.00012345')).toBe('0.00012345')
    expect(formatQuantity('1250.500')).toBe('1,250.5')
    expect(formatQuantity(3)).toBe('3')
  })

  it('caps the display at eight decimal places', () => {
    expect(formatQuantity('0.123456789123')).toBe('0.12345679')
  })
})

describe('formatDate', () => {
  it('formats ISO timestamps', () => {
    expect(formatDate('2026-03-05T12:00:00.000Z')).toBe('Mar 5, 2026')
  })

  it('does not throw on rubbish', () => {
    expect(formatDate('not a date')).toBe('-')
  })
})
