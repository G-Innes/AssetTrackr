import { getStoredAccessToken } from "./auth";

export function getCurrentUserId(): number | null {
    // Retrieve the token from local storage
    const token = getStoredAccessToken(localStorage);
  
    // Log the retrieved token
    console.log("Retrieved token:", token);
  
    // Check if token exists
    if (!token) {
      console.log("Token not found, returning null");
      return null;
    }
  
    try {
      // Split the token by '.' to extract the payload
      const [, payloadBase64] = token.split(".");
  
      // Decode the base64-encoded payload
      const decodedPayload = atob(payloadBase64);
  
      // Parse the JSON payload to access its properties
      const payload = JSON.parse(decodedPayload);
  
      // Log the decoded payload
      console.log("Decoded payload:", payload);
  
      // Extract the user ID
      const userId = payload.user.id;
  
      console.log("Extracted user ID:", userId);
  
      return userId;
    } catch (error) {
      // Log any errors that occur during decoding
      console.error("Error decoding token:", error);
      return null;
    }
  }