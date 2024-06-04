import axios from 'axios';


import { getStoredAccessToken, clearStoredAccessToken, storeAccessToken } from '../utils/auth';

// const baseURL = process.env.NODE_ENV === 'production' ? process.env.PROD_VUE_APP_BASE_URL : process.env.DEV_VUE_APP_BASE_URL;


const apiClient = axios.create({
  baseURL: 'https://assettrackr.enrpm9tib5nri.eu-central-1.cs.amazonlightsail.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach the token to every request
apiClient.interceptors.request.use(config => {
  const token = getStoredAccessToken(localStorage);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function signup(userData: { email: string, userName: string, password: string, confirmPassword: string }) {
  return apiClient.post('/user', userData);
}

// Adjust the type definition for the login payload
type LoginPayload = { usernameOrEmail: string; password: string };

// Accept either an email or a username
export async function login(userData: LoginPayload) {
  const response = await apiClient.post('/user/login', userData); // may need adjusted
  const token = response.data.token;
  storeAccessToken(localStorage, token);
  return response;
}

export function logout() {
  console.log('clearing token');
  clearStoredAccessToken(localStorage);
  console.log('token cleared');
}

export function isLoggedIn(): boolean {
  const token = getStoredAccessToken(localStorage);
  return !!token;
}

// New function to create an asset
type AssetPayload = {
  userId: number;
  assetId: number;
  quantity: number;
  name: string;
  ticker: string;
  current_price: number;
};

export function createAsset(payload: AssetPayload) {
  // Get the current user ID
  const userId = getCurrentUserId(); // You need to implement this function to retrieve the current user ID
  
  // Check if the user ID is valid
  if (!userId) {
    throw new Error('User ID not found');
  }
  
  // Include the user ID in the endpoint
  const endpoint = `/user/${userId}/assets`;
  
  // Make the API request
  return apiClient.post(endpoint, payload);
}

function getCurrentUserId(): number | null {
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

    // Extract the user ID from the payload
    const userId = payload.user.id;

    // Log the extracted user ID
    console.log("Extracted user ID:", userId);

    return userId;
  } catch (error) {
    // Log any errors that occur during decoding
    console.error("Error decoding token:", error);
    return null;
  }
}

