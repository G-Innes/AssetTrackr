import { z } from 'zod'
import { TransactionType } from '../../entities'
import { decimalInput } from '../../utils/decimal'

export const tickerSchema = z
  .string({ required_error: 'Ticker symbol is required' })
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9]{1,12}$/, 'Ticker must be 1-12 letters or numbers')

export const createTransactionSchema = z.object({
  ticker: tickerSchema,
  // Display name, used only the first time a ticker is seen.
  name: z.string().trim().min(1).max(60).optional(),
  type: z.nativeEnum(TransactionType, {
    errorMap: () => ({ message: 'Type must be "buy" or "sell"' }),
  }),
  quantity: decimalInput('Quantity'),
  // Price of one unit in USD
  price: decimalInput('Price', { allowZero: true }),
})

export const listTransactionsSchema = z.object({
  type: z
    .nativeEnum(TransactionType, {
      errorMap: () => ({ message: 'Type must be "buy" or "sell"' }),
    })
    .optional(),
  assetId: z.coerce
    .number({ invalid_type_error: 'assetId must be a number' })
    .int()
    .positive()
    .optional(),
})

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type ListTransactionsInput = z.infer<typeof listTransactionsSchema>
