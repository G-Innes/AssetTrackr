const wholeDollars = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

/** $1,234.56 - and enough decimals that a $0.00001234 coin does not show as $0.00 */
export function formatCurrency(value: number | string | null | undefined): string {
  const amount = Number(value ?? 0)
  if (!Number.isFinite(amount)) return '-'
  if (amount !== 0 && Math.abs(amount) < 1) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumSignificantDigits: 4,
    }).format(amount)
  }
  return wholeDollars.format(amount)
}

/** Up to 8 decimal places, without trailing zeros: 0.00012345, 1,250.5 */
export function formatQuantity(value: number | string): string {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '-'
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 8 }).format(amount)
}

export function formatDate(value: string | Date): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

/** +$1,234.56 / -$1,234.56: a change in value, always carrying its sign */
export function formatSignedCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '-'
  const sign = value > 0 ? '+' : value < 0 ? '-' : ''
  return `${sign}${formatCurrency(Math.abs(value))}`
}

/** +12.34% / -0.50% */
export function formatPercent(value: number | null | undefined, signed = true): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '-'
  const sign = signed && value > 0 ? '+' : value < 0 ? '-' : ''
  return `${sign}${Math.abs(value).toFixed(2)}%`
}

/** $1.2M, $45.3K, $980: for chart axes, where space is tight */
export function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

/** The local calendar day as YYYY-MM-DD, the format date inputs use */
export function toDateInputValue(value: string | Date = new Date()): string {
  const date = new Date(value)
  const pad = (part: number) => String(part).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
