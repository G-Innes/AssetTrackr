import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../../middleware/auth'
import { parse } from '../../middleware/validate'
import { asyncHandler } from '../../utils/asyncHandler'
import { listHoldings, removeHolding } from './service'

const assetIdSchema = z.coerce
  .number({ error: 'Invalid asset id' })
  .int('Invalid asset id')
  .positive('Invalid asset id')

const router = Router()
router.use(requireAuth)

router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await listHoldings(req.userId))
  })
)

router.delete(
  '/:assetId',
  asyncHandler(async (req, res) => {
    await removeHolding(req.userId, parse(assetIdSchema, req.params.assetId))
    res.status(204).send()
  })
)

export default router
