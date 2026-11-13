import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../../middleware/auth'
import { parse } from '../../middleware/validate'
import { asyncHandler } from '../../utils/asyncHandler'
import { notFound } from '../../utils/errors'
import { tickerSchema } from '../transactions/schemas'
import { findAsset, getPrice, searchAssets } from './service'

const searchSchema = z.object({
  q: z.string().trim().max(40).default(''),
  limit: z.coerce.number().int().min(1).max(50).default(10),
})

const priceSchema = z.object({
  // Omit for the live price; pass a day for that day's closing price
  date: z.iso.date('date must look like 2026-03-05').optional(),
})

const router = Router()
// Signed-in users only: this is a convenience for the app, not a public proxy.
router.use(requireAuth)

// GET /api/market/assets?q=bit&limit=10
router.get(
  '/assets',
  asyncHandler(async (req, res) => {
    const { q, limit } = parse(searchSchema, req.query)
    res.json(await searchAssets(q, limit))
  })
)

// GET /api/market/assets/BTC/price?date=2026-03-05
router.get(
  '/assets/:ticker/price',
  asyncHandler(async (req, res) => {
    const ticker = parse(tickerSchema, req.params.ticker)
    const { date } = parse(priceSchema, req.query)
    if (!(await findAsset(ticker))) throw notFound(`Unknown asset ${ticker}`)

    const price = await getPrice(ticker, date)
    if (price === undefined) {
      throw notFound(
        `No price available for ${ticker}${date ? ` on ${date}` : ''}`
      )
    }
    res.json({
      ticker,
      date: date ?? new Date().toISOString().slice(0, 10),
      price,
    })
  })
)

export default router
