import { QueryFailedError, EntityNotFoundError } from 'typeorm'
import { z } from 'zod'

// Function to handle errors and return appropriate status code and message
export async function handleError(error: Error) {
  // Default
  let statusCode = 500
  let message = 'An unexpected error occurred'

  // If the error is a Zod validation error return a 400 status and the error message
  if (error instanceof z.ZodError) {
    statusCode = 400

    // Find if the error is related to email or password
    const emailError = error.errors.find((subError) =>
      subError.path.includes('email')
    )
    const passwordError = error.errors.find((subError) =>
      subError.path.includes('password')
    )
    // Set appropriate error messages based on the type of validation error
    if (emailError) {
      message = 'Invalid email format'
    } else if (passwordError) {
      message = 'Password must be at least 8 characters'
    }
  } else if (error instanceof QueryFailedError) {
    // If it's a database error, use the error message from the database
    message = error.message
  } else if (error instanceof EntityNotFoundError) {
    // Handle EntityNotFoundError specifically
    statusCode = 404
    message = 'Resource not found'
  }
  return { statusCode, message }
}
