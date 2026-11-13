import Decimal from 'decimal.js'
import { z } from 'zod'

// Plenty of headroom for numeric(36,18) arithmetic without rounding.
Decimal.set({ precision: 60 })

const MAX_DECIMAL_PLACES = 18
const MAX_VALUE = new Decimal('1e15')

/**
 * A decimal amount sent by a client, as a number or a numeric string.
 * Returns a plain (non-exponent) string suitable for a numeric(36,18) column.
 */
export function decimalInput(label: string, { allowZero = false } = {}) {
  return z
    .union([z.string().trim().min(1), z.number()], {
      error: `${label} is required and must be a number`,
    })
    .transform((value, ctx) => {
      let amount: Decimal
      try {
        amount = new Decimal(value)
      } catch {
        ctx.addIssue({ code: 'custom', message: `${label} must be a number` })
        return z.NEVER
      }

      let problem: string | undefined
      if (!amount.isFinite()) problem = `${label} must be a number`
      else if (amount.isNegative() && allowZero)
        problem = `${label} cannot be negative`
      else if (
        amount.isNegative() ||
        (amount.isZero() !== allowZero && amount.isZero())
      )
        problem = `${label} must be greater than zero`
      else if (amount.gte(MAX_VALUE)) problem = `${label} is too large`
      else if (amount.decimalPlaces() > MAX_DECIMAL_PLACES)
        problem = `${label} can have at most ${MAX_DECIMAL_PLACES} decimal places`

      if (problem) {
        ctx.addIssue({ code: 'custom', message: problem })
        return z.NEVER
      }
      return amount.toFixed()
    })
}

/** "1.500000000000000000" (as Postgres returns it) -> "1.5" */
export function formatDecimal(value: string | Decimal): string {
  return new Decimal(value).toFixed()
}

export { Decimal }
