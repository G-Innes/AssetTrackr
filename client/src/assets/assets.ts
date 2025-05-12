export interface Asset {
  assetId: number
  ticker: string
  name: string
}

// Helper function to generate descriptive names from tickers
function generateName(ticker: string): string {
  // For common cryptocurrencies, use more readable names
  const cryptoNames: Record<string, string> = {
    BTC: 'Bitcoin',
    ETH: 'Ethereum',
    ADA: 'Cardano',
    XRP: 'Ripple',
    DOT: 'Polkadot',
    DOGE: 'Dogecoin',
    USDT: 'Tether',
    USDC: 'USD Coin',
    SOL: 'Solana',
    AVAX: 'Avalanche',
    LINK: 'Chainlink',
    MATIC: 'Polygon',
    LTC: 'Litecoin',
    ALGO: 'Algorand',
    XLM: 'Stellar',
    UNI: 'Uniswap',
    AAVE: 'Aave',
    FTM: 'Fantom',
    ATOM: 'Cosmos',
    VET: 'VeChain',
    DAI: 'Dai',
    ETC: 'Ethereum Classic',
    FIL: 'Filecoin',
    XTZ: 'Tezos',
    LUNA: 'Terra',
    HBAR: 'Hedera',
    EOS: 'EOS',
    FLOW: 'Flow',
    AXS: 'Axie Infinity',
    SAND: 'The Sandbox',
  }

  if (cryptoNames[ticker]) {
    return cryptoNames[ticker]
  }

  // Otherwise generate name from ticker
  return (
    ticker
      .split('')
      .map((char, i) => (i === 0 ? char.toUpperCase() : char.toLowerCase()))
      .join('') + ' Token'
  )
}

// Add names to all assets
export const assets: Asset[] = [
  { assetId: 2, ticker: '1INCH', name: '1inch' },
  { assetId: 3, ticker: 'AAVE', name: 'Aave' },
  { assetId: 4, ticker: 'ABT', name: 'Arcblock' },
  { assetId: 5, ticker: 'ACH', name: 'Alchemy Pay' },
  { assetId: 6, ticker: 'ACS', name: 'Access Protocol' },
  { assetId: 7, ticker: 'ADA', name: 'Cardano' },
  { assetId: 8, ticker: 'AED', name: 'UAE Dirham' },
  { assetId: 9, ticker: 'AERGO', name: 'Aergo' },
  { assetId: 10, ticker: 'AERO', name: 'Aerodrome' },
  { assetId: 11, ticker: 'AEVO', name: 'Aevo' },
  { assetId: 12, ticker: 'AFN', name: 'Afghan Afghani' },
  { assetId: 13, ticker: 'AGLD', name: 'Adventure Gold' },
  { assetId: 14, ticker: 'AIOZ', name: 'AIOZ Network' },
  { assetId: 15, ticker: 'AKT', name: 'Akash Network' },
  { assetId: 16, ticker: 'ALCX', name: 'Alchemix' },
  { assetId: 17, ticker: 'ALEPH', name: 'Aleph.im' },
  { assetId: 18, ticker: 'ALGO', name: 'Algorand' },
  { assetId: 19, ticker: 'ALICE', name: 'My Neighbor Alice' },
  { assetId: 20, ticker: 'ALL', name: 'Albanian Lek' },
  { assetId: 21, ticker: 'AMD', name: 'Advanced Micro Devices' },
  { assetId: 22, ticker: 'AMP', name: 'Amp Token' },
  { assetId: 23, ticker: 'ANG', name: 'Netherlands Antillean Guilder' },
  { assetId: 24, ticker: 'ANKR', name: 'Ankr' },
  { assetId: 25, ticker: 'ANT', name: 'Aragon' },
  { assetId: 75, ticker: 'BTC', name: 'Bitcoin' },
  { assetId: 140, ticker: 'ETH', name: 'Ethereum' },
  { assetId: 123, ticker: 'DOGE', name: 'Dogecoin' },
  { assetId: 125, ticker: 'DOT', name: 'Polkadot' },
  { assetId: 148, ticker: 'FIL', name: 'Filecoin' },
  { assetId: 245, ticker: 'LTC', name: 'Litecoin' },
  { assetId: 254, ticker: 'MATIC', name: 'Polygon' },
]
