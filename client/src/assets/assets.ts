export interface KnownAsset {
  ticker: string
  name: string
}

// Suggestions for the buy/sell form. Any other ticker Coinbase prices can
// still be typed in by hand.
export const assets: KnownAsset[] = [
  { ticker: 'BTC', name: 'Bitcoin' },
  { ticker: 'ETH', name: 'Ethereum' },
  { ticker: 'SOL', name: 'Solana' },
  { ticker: 'XRP', name: 'XRP' },
  { ticker: 'ADA', name: 'Cardano' },
  { ticker: 'DOGE', name: 'Dogecoin' },
  { ticker: 'AVAX', name: 'Avalanche' },
  { ticker: 'DOT', name: 'Polkadot' },
  { ticker: 'LINK', name: 'Chainlink' },
  { ticker: 'LTC', name: 'Litecoin' },
  { ticker: 'BCH', name: 'Bitcoin Cash' },
  { ticker: 'UNI', name: 'Uniswap' },
  { ticker: 'ATOM', name: 'Cosmos' },
  { ticker: 'XLM', name: 'Stellar' },
  { ticker: 'ETC', name: 'Ethereum Classic' },
  { ticker: 'ALGO', name: 'Algorand' },
  { ticker: 'FIL', name: 'Filecoin' },
  { ticker: 'AAVE', name: 'Aave' },
  { ticker: 'NEAR', name: 'NEAR Protocol' },
  { ticker: 'APT', name: 'Aptos' },
  { ticker: 'ARB', name: 'Arbitrum' },
  { ticker: 'OP', name: 'Optimism' },
  { ticker: 'SHIB', name: 'Shiba Inu' },
  { ticker: 'XTZ', name: 'Tezos' },
  { ticker: 'HBAR', name: 'Hedera' },
  { ticker: 'ICP', name: 'Internet Computer' },
  { ticker: 'SUI', name: 'Sui' },
  { ticker: 'USDC', name: 'USD Coin' },
  { ticker: 'USDT', name: 'Tether' },
  { ticker: 'DAI', name: 'Dai' },
]
