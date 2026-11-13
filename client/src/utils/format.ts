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
