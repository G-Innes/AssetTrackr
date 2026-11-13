import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../../middleware/auth'
import { parse } from '../../middleware/validate'
import { asyncHandler } from '../../utils/asyncHandler'
import { idSchema } from '../transactions/schemas'
import {
  HISTORY_RANGES,
  HistoryRange,
  getPortfolio,
  getPortfolioHistory,
  removeAsset,
} from './service'

const historySchema = z.object({
  range: z
    .enum(Object.keys(HISTORY_RANGES) as [HistoryRange, ...HistoryRange[]], {
      error: 'range must be one of 30d, 90d or 1y',
    })
    .default('90d'),
})

const router = Router()
router.use(requireAuth)

router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await getPortfolio(req.userId))
  })
)

// GET /api/portfolio/history?range=30d|90d|1y
router.get(
  '/history',
  asyncHandler(async (req, res) => {
    const { range } = parse(historySchema, req.query)
    res.json({ range, points: await getPortfolioHistory(req.userId, range) })
  })
)

router.delete(
  '/assets/:assetId',
  asyncHandler(async (req, res) => {
    await removeAsset(req.userId, parse(idSchema, req.params.assetId))
    res.status(204).send()
  })
)

export default router
