import { QueryFailedError, EntityNotFoundError } from 'typeorm'
import { z } from 'zod'

// Function to handle errors and return appropriate status code and message
export async function handleError(error: Error) {
  // console.error('Error:', error);
  // Default error response
  let statusCode = 500
  let message = 'An unexpected error occurred'

  // If the error is a Zod validation error, return a 400 status and the specific error message
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
    } else {
      message = 'Validation error'
    }
  } else if (error.message === 'Invalid username or email') {
    // Specific error for authentication failure
    statusCode = 401
    message = 'Invalid username or email'
  } else if (error.message === 'Invalid password') {
    // Specific error for authentication failure
    statusCode = 401
    message = 'Invalid password'
  } else if (error instanceof QueryFailedError) {
    // Handle duplicate key constraint errors
    const driverError = (error as any).driverError
    if (driverError?.code === '23505') {
      statusCode = 400
      if (driverError.detail?.includes('username')) {
        message = 'Username already in use'
      } else if (driverError.detail?.includes('email')) {
        message = 'Email already in use'
      } else {
        message = 'A record with this value already exists'
      }
    } else {
      message = 'Database error occurred'
    }
  } else if (error instanceof EntityNotFoundError) {
    // Handle EntityNotFoundError specifically
    statusCode = 404
    if (error.message.includes('User')) {
      message = 'User not found'
    } else if (error.message.includes('Asset')) {
      message = 'Asset not found'
    }
  } else if (error.message.includes('Invalid transaction type:')) {
    // Handle invalid transaction type error
    statusCode = 400
    message = error.message
  }
  return { statusCode, message }
}
