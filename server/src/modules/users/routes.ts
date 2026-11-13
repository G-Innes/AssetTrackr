import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../../middleware/auth'
import { parse } from '../../middleware/validate'
import { asyncHandler } from '../../utils/asyncHandler'
import { emailSchema, passwordSchema, usernameSchema } from '../auth/schemas'
import { changePassword, deleteUser, getUser, updateUser } from './service'

const updateSchema = z
  .object({
    username: usernameSchema.optional(),
    email: emailSchema.optional(),
  })
  .refine((body) => body.username !== undefined || body.email !== undefined, {
    message: 'Provide a username or an email to update',
  })

const passwordChangeSchema = z.object({
  currentPassword: z
    .string({ error: 'Current password is required' })
    .min(1, 'Current password is required')
    .max(72),
  newPassword: passwordSchema,
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

router.put(
  '/password',
  asyncHandler(async (req, res) => {
    const input = parse(passwordChangeSchema, req.body)
    await changePassword(req.userId, input)
    res.status(204).send()
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
