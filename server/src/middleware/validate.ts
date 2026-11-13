import { z } from 'zod'
import { badRequest } from '../utils/errors'

/**
 * Parses untrusted input with a zod schema. On failure it throws a 400 whose
 * message names the first problem and whose details list all of them.
 */
export function parse<Schema extends z.ZodType>(
  schema: Schema,
  input: unknown
): z.infer<Schema> {
  const result = schema.safeParse(input)
  if (result.success) return result.data

  const issues = result.error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }))
  throw badRequest(issues[0]?.message ?? 'Invalid request', issues)
}
