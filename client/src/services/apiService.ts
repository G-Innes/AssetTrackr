import axios from 'axios'
import { getStoredAccessToken, clearStoredAccessToken, storeAccessToken } from '../utils/auth'
import { getCurrentUserId } from '@/utils/user'
import { getLivePrice } from '@/utils/getLivePrice'
import type { Asset } from '@/components/AssetCard.vue'
import type { Transaction } from '../components/TransactionCard.vue'
import { assets } from '../assets/assets'

const baseURL =
  import.meta.env.MODE === 'production'
    ? 'https://assettrackr.enrpm9tib5nri.eu-central-1.cs.amazonlightsail.com'
    : 'http://localhost:3000'
// const baseURL = 'https://assettrackr.enrpm9tib5nri.eu-central-1.cs.amazonlightsail.com';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor to attach the token to every request
apiClient.interceptors.request.use((config) => {
  const token = getStoredAccessToken(localStorage)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function signup(userData: {
  email: string
  userName: string
  password: string
  confirmPassword: string
}) {
  return apiClient.post('/api/user', userData)
}

// Adjust the type definition for the login payload
type LoginPayload = { usernameOrEmail: string; password: string }

// Accept either an email or a username
export async function login(userData: LoginPayload) {
  try {
    const response = await apiClient.post('/api/user/login', userData)
    
    if (response.data && response.data.token) {
      storeAccessToken(localStorage, response.data.token)
    }
    
    return response
  } catch (error) {
    console.error('Login error in API service:', error)
    throw error
  }
}

export function logout() {
  clearStoredAccessToken(localStorage)
}

export function isLoggedIn(): boolean {
  const token = getStoredAccessToken(localStorage)
  return !!token
}

type AssetPayload = {
  userId: number
  assetId: number
  quantity: number
  name: string
  ticker: string
  current_price: number
}

export function createAsset(payload: AssetPayload) {
  const userId = getCurrentUserId()

  if (!userId) {
    throw new Error('User ID not found')
  }

  const endpoint = `/api/user/${userId}/assets`

  return apiClient.post(endpoint, payload)
}

export async function getAllAssetHoldingsForUser(): Promise<Asset[]> {
  const userId = getCurrentUserId()

  if (!userId) {
    throw new Error('User ID not found')
  }

  const endpoint = `/api/user/${userId}/assets`

  try {
    const response = await apiClient.get(endpoint)
    const assets: AssetPayload[] = response.data

    // Fetch live prices for each asset
    const promises = assets.map(async (asset: any) => {
      try {
        const livePrice = await getLivePrice(asset.ticker)
        if (livePrice !== null) {
          asset.current_price = livePrice
          asset.total_value = livePrice * asset.quantity // Calculate total value
        } else {
          asset.current_price = null
          asset.total_value = null // Null if price fetch fails
        }
        return asset as Asset
      } catch (error) {
        console.error(`Error fetching live price for ${asset.ticker}:`, error)
        asset.current_price = null
        asset.total_value = null // Handle error by setting total_value to null
        return asset as Asset
      }
    })

    // Wait for promises to resolve
    return Promise.all(promises)
  } catch (error) {
    console.error('Error fetching user assets', error)
    throw error
  }
}

export async function getAllUserAssets(): Promise<Asset[]> {
  const userId = getCurrentUserId()
  const response = await apiClient.get(`/api/user/${userId}/assets`)

  return response.data
}

export async function getAllTransactionsForUser() {
  const userId = getCurrentUserId()

  if (!userId) {
    throw new Error('User ID not found')
  }

  try {
    const transactionsResponse = await apiClient.get(`/api/user/${userId}/transactions`)
    
    if (!transactionsResponse.data || !Array.isArray(transactionsResponse.data)) {
      console.error('Invalid transactions response format:', transactionsResponse.data)
      return []
    }
    
    const transactions = transactionsResponse.data

    // Log original transaction data for debugging
    console.log('Original transactions data:', transactions);

    // Create a mapping of asset IDs to asset details
    const assetsMap: Record<number, {ticker: string, name: string}> = {}
    
    // Since we know assets from assets.ts have these properties
    assets.forEach((asset: any) => {
      if (asset.assetId !== undefined) {
        // For assets without a name property, use the ticker as the name
        const name = asset.name || asset.ticker || 'Unknown Asset';
        assetsMap[asset.assetId] = {
          ticker: asset.ticker || 'N/A',
          name: name
        }
      }
    })

    // Enrich transactions with asset information
    const enrichedTransactions = transactions.map((transaction: any) => {
      // Check if a transaction has an assetId
      if (transaction.assetId === undefined && transaction.asset_id !== undefined) {
        transaction.assetId = transaction.asset_id; // Map snake_case to camelCase
      }
      
      // Get asset info from the mapping or provide defaults
      const assetInfo = transaction.assetId ? assetsMap[transaction.assetId] : null;
      
      // If no asset info is found but we have a ticker, create a name from the ticker
      const ticker = assetInfo?.ticker || transaction.ticker || transaction.asset_ticker || 'N/A';
      const name = assetInfo?.name || transaction.name || transaction.asset_name || ticker || 'Unknown Asset';
      
      // Normalize field names to ensure consistent access in components
      return {
        ...transaction,
        // Add asset information
        assetTicker: ticker,
        asset_ticker: ticker,
        assetName: name,
        asset_name: name,
        // Normalize transaction type field
        transactionType: transaction.transactionType || transaction.transaction_type || 'Unknown',
        transaction_type: transaction.transaction_type || transaction.transactionType || 'Unknown',
        // Ensure other fields have standard names
        id: transaction.id,
        quantity: transaction.quantity || 0,
        price: transaction.price || 0,
        transaction_date: transaction.transaction_date || transaction.transactionDate || new Date().toISOString(),
        transactionDate: transaction.transactionDate || transaction.transaction_date || new Date().toISOString()
      }
    })

    // Log enriched data for debugging
    console.log('Enriched transactions data:', enrichedTransactions);
    
    return enrichedTransactions
  } catch (error) {
    console.error('Error fetching transactions or assets:', error)
    // Return empty array instead of throwing to prevent component errors
    return []
  }
}

export async function getTransactionsByType(type: string) {
  const userId = getCurrentUserId()

  if (!userId) {
    throw new Error('User ID not found')
  }

  // Ensure type is valid
  const validType = type.toLowerCase();
  if (validType !== 'buy' && validType !== 'sell') {
    console.warn(`Invalid transaction type: ${type}, defaulting to all transactions`);
    return getAllTransactionsForUser();
  }

  const endpoint = `/api/user/${userId}/transactions/type/${validType}`

  try {
    const response = await apiClient.get(endpoint)
    
    if (!response.data || !Array.isArray(response.data)) {
      console.error('Invalid transactions response format:', response.data)
      return []
    }
    
    const transactions = response.data

    // Log original transaction data for debugging
    console.log('Transactions by type data:', transactions);

    // Create a mapping of asset IDs to asset details
    const assetsMap: Record<number, {ticker: string, name: string}> = {}
    
    // Since we know assets from assets.ts have these properties
    assets.forEach((asset: any) => {
      if (asset.assetId !== undefined) {
        // For assets without a name property, use the ticker as the name
        const name = asset.name || asset.ticker || 'Unknown Asset';
        assetsMap[asset.assetId] = {
          ticker: asset.ticker || 'N/A',
          name: name
        }
      }
    })

    // Enrich transactions with asset information
    const enrichedTransactions = transactions.map((transaction: any) => {
      // Check if a transaction has an assetId
      if (transaction.assetId === undefined && transaction.asset_id !== undefined) {
        transaction.assetId = transaction.asset_id; // Map snake_case to camelCase
      }
      
      // Get asset info from the mapping or provide defaults
      const assetInfo = transaction.assetId ? assetsMap[transaction.assetId] : null;
      
      // If no asset info is found but we have a ticker, create a name from the ticker
      const ticker = assetInfo?.ticker || transaction.ticker || transaction.asset_ticker || 'N/A';
      const name = assetInfo?.name || transaction.name || transaction.asset_name || ticker || 'Unknown Asset';
      
      // Normalize field names to ensure consistent access in components
      return {
        ...transaction,
        // Add asset information
        assetTicker: ticker,
        asset_ticker: ticker,
        assetName: name,
        asset_name: name,
        // Normalize transaction type field
        transactionType: transaction.transactionType || transaction.transaction_type || validType,
        transaction_type: transaction.transaction_type || transaction.transactionType || validType,
        // Ensure other fields have standard names
        id: transaction.id,
        quantity: transaction.quantity || 0,
        price: transaction.price || 0,
        transaction_date: transaction.transaction_date || transaction.transactionDate || new Date().toISOString(),
        transactionDate: transaction.transactionDate || transaction.transaction_date || new Date().toISOString()
      }
    })
    
    return enrichedTransactions
  } catch (error) {
    console.error('Error fetching transactions by type:', error)
    // Return empty array instead of throwing
    return []
  }
}

export async function getUserProfile(): Promise<{ id: number; username: string; email: string }> {
  const userId = getCurrentUserId()

  if (!userId) {
    throw new Error('User ID not found')
  }

  const endpoint = `/api/user/user/${userId}`

  try {
    const response = await apiClient.get(endpoint)
    return response.data
  } catch (error) {
    console.error('Error fetching user profile', error)
    throw error
  }
}
