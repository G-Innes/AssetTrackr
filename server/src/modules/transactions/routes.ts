import { Router } from 'express'
import { requireAuth } from '../../middleware/auth'
import { parse } from '../../middleware/validate'
import { asyncHandler } from '../../utils/asyncHandler'
import {
  createTransactionSchema,
  idSchema,
  listTransactionsSchema,
  updateTransactionSchema,
} from './schemas'
import {
  createTransaction,
  deleteTransaction,
  listTransactions,
  updateTransaction,
} from './service'

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

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = parse(idSchema, req.params.id)
    const changes = parse(updateTransactionSchema, req.body)
    res.json(await updateTransaction(req.userId, id, changes))
  })
)

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await deleteTransaction(req.userId, parse(idSchema, req.params.id))
    res.status(204).send()
  })
)

export default router
