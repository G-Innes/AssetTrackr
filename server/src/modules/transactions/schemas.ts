import { z } from 'zod'
import { TransactionType } from '../../entities'
import { decimalInput } from '../../utils/decimal'

export const tickerSchema = z
  .string({ error: 'Ticker symbol is required' })
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9]{1,12}$/, 'Ticker must be 1-12 letters or numbers')

const typeSchema = z.enum(TransactionType, {
  error: 'Type must be "buy" or "sell"',
})

// Bitcoin's first block; nothing could have been traded before it.
const EARLIEST = new Date('2009-01-03T00:00:00Z')

const executedAtSchema = z.coerce
  .date({ error: 'Date is not valid' })
  .refine((date) => date >= EARLIEST, 'Date is too far in the past')
  // a little slack for clocks that run ahead of the server's
  .refine(
    (date) => date.getTime() <= Date.now() + 5 * 60 * 1000,
    'Date cannot be in the future'
  )

const noteSchema = z
  .string()
  .trim()
  .max(200, 'Note must be at most 200 characters')
  .transform((note) => note || null)
  .nullable()

export const createTransactionSchema = z.object({
  ticker: tickerSchema,
  type: typeSchema,
  quantity: decimalInput('Quantity'),
  // USD price of one unit. Leave out to use the market price on that date.
  price: decimalInput('Price', { allowZero: true }).optional(),
  // Leave out for "now"
  executedAt: executedAtSchema.optional(),
  note: noteSchema.optional(),
})

export const updateTransactionSchema = z
  .object({
    type: typeSchema.optional(),
    quantity: decimalInput('Quantity').optional(),
    price: decimalInput('Price', { allowZero: true }).optional(),
    executedAt: executedAtSchema.optional(),
    note: noteSchema.optional(),
  })
  .refine((body) => Object.values(body).some((value) => value !== undefined), {
    message: 'Nothing to update',
  })

export const listTransactionsSchema = z.object({
  type: typeSchema.optional(),
  assetId: z.coerce
    .number({ error: 'assetId must be a number' })
    .int()
    .positive()
    .optional(),
})

export const idSchema = z.coerce
  .number({ error: 'Invalid id' })
  .int('Invalid id')
  .positive('Invalid id')

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>
export type ListTransactionsInput = z.infer<typeof listTransactionsSchema>
