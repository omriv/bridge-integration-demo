// Example configuration file
// Copy this file to config.ts and update with your actual customer ID

export const config = {
  // Backend proxy server URLs
  baseUrl: 'http://localhost:3001/api',
  mockBaseUrl: 'http://localhost:3002/api',
  
  // Mock mode flag (defaults to false - real data)
  // Can be toggled via UI, persisted in sessionStorage
  useMock: false,
  
  // Your default Bridge customer ID for testing
  // You can find this in your Bridge dashboard or API responses
  customerId: 'cfbc5326-25ff-43fb-82c9-6e800566f490',
  
  // Conversion rates to USD (updated December 5, 2025)
  // USDC, USDB, PYUDC are USD-pegged stablecoins = 1.00 USD
  // EURC is EUR-pegged stablecoin (1 EUR ≈ 1.05 USD as of Dec 2025)
  conversionRates: {
    usdc: 1.00,    // USD Coin (1:1 with USD)
    usdb: 1.00,    // USD Base (1:1 with USD)
    pyusd: 1.00,   // PayPal USD Coin (1:1 with USD)
    eurc: 1.05,    // Euro Coin (1 EURC ≈ 1.05 USD)
    usdt: 1.00,    // Tether USD (1:1 with USD)
    dai: 1.00,     // DAI (1:1 with USD)
    // Add other currencies as needed
    eth: 3800.00,  // Ethereum (approximate)
    weth: 3800.00, // Wrapped Ethereum (same as ETH)
    btc: 42000.00, // Bitcoin (approximate)
    wbtc: 42000.00,// Wrapped Bitcoin (same as BTC)
    matic: 0.85,   // Polygon (approximate)
    sol: 95.00,    // Solana (approximate)
    avax: 38.00,   // Avalanche (approximate)
    bnb: 310.00,   // Binance Coin (approximate)
  } as Record<string, number>,
  
  // Payment rail options for transfers
  paymentRails: [
    'ach',
    'ach_push',
    'ach_same_day',
    'arbitrum',
    'avalanche_c_chain',
    'base',
    'bridge_wallet',
    'ethereum',
    'optimism',
    'polygon',
    'sepa',
    'solana',
    'spei',
    'stellar',
    'swift',
    'tron',
    'wire',
  ] as const,
  
  // Currency options for transfers
  currencies: [
    'dai',
    'eur',
    'eurc',
    'mxn',
    'pyusd',
    'usd',
    'usdb',
    'usdc',
    'usdt',
  ] as const,
};

// Helper function to get the appropriate base URL based on mock mode
export const getBaseUrl = (useMock: boolean = config.useMock): string => {
  return useMock ? config.mockBaseUrl : config.baseUrl;
};
