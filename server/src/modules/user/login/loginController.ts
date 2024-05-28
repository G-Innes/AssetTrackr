import { Request, Response } from 'express'
import { handleError } from '../../../utils/errorHandlingUtils';
import { loginUser } from './authService'

export async function login(req: Request, res: Response) {
  try {
    // Parse the request body into the login data
    const { usernameOrEmail, password } = req.body;

    // Call authentication service
    const result = await loginUser(usernameOrEmail, password);

    // Return the result
    return res.json(result);
  } catch (error) {
    // If an error occurs, ensure it's an instance of Error
    if (error instanceof Error) {
      // If it is, handle the error and return the status code and message
      const { statusCode, message } = await handleError(error);
      return res.status(statusCode).json({ message });
    }
    // Handle the case where error is not an instance of Error
    return res.status(500).json({ message: 'An unexpected error occurred' });
  }
}
