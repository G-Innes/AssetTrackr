import axios from 'axios'

async function getLivePrice(ticker: string): Promise<number | null> {
  try {
    const url = `https://api.coinbase.com/v2/exchange-rates?currency=${ticker}`
    const response = await axios.get(url)

    // Check if response is successful
    if (response.status !== 200) {
      throw new Error(`Failed to fetch data from Coinbase. Status: ${response.status}`)
    }

    // Extract the price
    const priceData = response.data.data
    const exchangeRate = parseFloat(priceData.rates.USD)
    // Check if the price is valid
    if (isNaN(exchangeRate)) {
      throw new Error(`Invalid price data for ${ticker}`)
    }

    return exchangeRate
  } catch (error) {
    console.error(`Error fetching live price for ${ticker}:`, error)
    return null // Return null to handle errors in the calling function
  }
}

export { getLivePrice }
