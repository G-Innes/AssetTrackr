import { z } from 'zod'

export const usernameSchema = z
  .string({ required_error: 'Username is required' })
  .trim()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be at most 20 characters')
  .regex(
    /^[A-Za-z0-9_.-]+$/,
    'Username can only contain letters, numbers, dots, dashes and underscores'
  )

export const emailSchema = z
  .string({ required_error: 'Email is required' })
  .trim()
  .toLowerCase()
  .max(254, 'Email is too long')
  .email('Invalid email format')

export const signupSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    // bcrypt silently ignores everything after 72 bytes
    .max(72, 'Password must be at most 72 characters'),
})

export const loginSchema = z.object({
  usernameOrEmail: z
    .string({ required_error: 'Username or email is required' })
    .trim()
    .toLowerCase()
    .min(1, 'Username or email is required')
    .max(254),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required')
    .max(72),
})

export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
