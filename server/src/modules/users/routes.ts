import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../../middleware/auth'
import { parse } from '../../middleware/validate'
import { asyncHandler } from '../../utils/asyncHandler'
import { emailSchema, usernameSchema } from '../auth/schemas'
import { deleteUser, getUser, updateUser } from './service'

const updateSchema = z
  .object({
    username: usernameSchema.optional(),
    email: emailSchema.optional(),
  })
  .refine((body) => body.username !== undefined || body.email !== undefined, {
    message: 'Provide a username or an email to update',
  })

const router = Router()
router.use(requireAuth)

router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await getUser(req.userId))
  })
)

router.patch(
  '/',
  asyncHandler(async (req, res) => {
    const changes = parse(updateSchema, req.body)
    res.json(await updateUser(req.userId, changes))
  })
)

router.delete(
  '/',
  asyncHandler(async (req, res) => {
    await deleteUser(req.userId)
    res.status(204).send()
  })
)

export default router
