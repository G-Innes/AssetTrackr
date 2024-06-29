import { getStoredAccessToken } from './auth'

export function getCurrentUserId(): number | null {
  // Retrieve the token from local storage
  const token = getStoredAccessToken(localStorage)

  // Check if token exists
  if (!token) {
    return null
  }

  try {
    // Split the token by '.' to extract the payload
    const [, payloadBase64] = token.split('.')

    // Decode the base64-encoded payload
    const decodedPayload = atob(payloadBase64)

    // Parse the JSON payload to access its properties
    const payload = JSON.parse(decodedPayload)

    // Extract the user ID
    const userId = payload.user.id

    return userId
  } catch (error) {
    // Log any errors that occur during decoding
    console.error('Error decoding token:', error)
    return null
  }
}
