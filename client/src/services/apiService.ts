import axios from 'axios';
import { getStoredAccessToken, clearStoredAccessToken, storeAccessToken } from '../utils/auth';
import { getCurrentUserId } from '@/utils/user';
import { getLivePrice } from '@/utils/getLivePrice';
import type { Asset } from '@/components/AssetCard.vue';

const baseURL = process.env.NODE_ENV === 'production' ? 'https://assettrackr.enrpm9tib5nri.eu-central-1.cs.amazonlightsail.com' : 'http://localhost:3000';


const apiClient = axios.create({
  baseURL,
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
  return apiClient.post('/api/user', userData);
}

// Adjust the type definition for the login payload
type LoginPayload = { usernameOrEmail: string; password: string };

// Accept either an email or a username
export async function login(userData: LoginPayload) {
  const response = await apiClient.post('/api/user/login', userData); // may need adjusted
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
  const userId = getCurrentUserId();

  if (!userId) {
    throw new Error('User ID not found');
  }

  // Include the user ID in the endpoint
  const endpoint = `/api/user/${userId}/assets`;

  // Make the API request
  return apiClient.post(endpoint, payload);
}

export async function getAllAssetHoldingsForUser(): Promise<Asset[]>  {

  const userId = getCurrentUserId();

  if (!userId) {
    throw new Error('User ID not found');
  }

  const endpoint = `/api/user/${userId}/assets`;


  try {
    const response = await apiClient.get(endpoint);
    const assets: AssetPayload[] = response.data;

    // Fetch live prices for each asset
    const promises = assets.map(async (asset:any) => {
      try {
        const livePrice = await getLivePrice(asset.ticker);
        if (livePrice !== null) {
          asset.current_price = livePrice;
          asset.total_value = livePrice * asset.quantity; // Calculate total value
        } else {
          asset.current_price = null;
          asset.total_value = null; // Null if price fetch fails
        }
        return asset as Asset;
      } catch (error) {
        console.error(`Error fetching live price for ${asset.ticker}:`, error);
        asset.current_price = null;
        asset.total_value = null; // Handle error by setting total_value to null
        return asset as Asset;
      }
      });

    // Wait for promises to resolve
    return Promise.all(promises);
  } catch (error) {
    console.error('Error fetching user assets', error);
    throw error;
  }
}

export async function getUserProfile(): Promise<{ id: number; username: string; email: string }> {
  const userId = getCurrentUserId();

  if (!userId) {
    throw new Error('User ID not found');
  }

  const endpoint = `/api/user/user/${userId}`;

  try {
    const response = await apiClient.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile', error);
    throw error;
  }
}

