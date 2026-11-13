import axios from 'axios'

/** Current USD price of one unit, or null if Coinbase has no price for the ticker. */
export async function getLivePrice(ticker: string): Promise<number | null> {
  try {
    const response = await axios.get('https://api.coinbase.com/v2/exchange-rates', {
      params: { currency: ticker },
      timeout: 10000,
    })
    const price = parseFloat(response.data?.data?.rates?.USD)
    return Number.isFinite(price) && price > 0 ? price : null
  } catch {
    return null
  }
}
