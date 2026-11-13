import { Router } from 'express'
import { requireAuth } from '../../middleware/auth'
import { parse } from '../../middleware/validate'
import { asyncHandler } from '../../utils/asyncHandler'
import { createTransactionSchema, listTransactionsSchema } from './schemas'
import { createTransaction, listTransactions } from './service'

const router = Router()
router.use(requireAuth)

// GET /api/transactions?type=buy|sell&assetId=1
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const filters = parse(listTransactionsSchema, req.query)
    res.json(await listTransactions(req.userId, filters))
  })
)

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const input = parse(createTransactionSchema, req.body)
    res.status(201).json(await createTransaction(req.userId, input))
  })
)

export default router
