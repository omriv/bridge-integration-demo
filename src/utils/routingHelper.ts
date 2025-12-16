import { RailType } from '../types';

// Helper function to filter routing table based on source payment rail and currency

export interface Route {
  sourceRail: string;
  sourceCurrency: string;
  destinationRail: string;
  destinationCurrency: string;
  transactionMinimum: string;
  sourceRailType?: RailType;
  destinationRailType?: RailType;
}

// Normalize rail/currency values to match routing table format
function normalizeRail(rail: string): string {
  // Mapping from API format to routing table format
  const railMapping: Record<string, string> = {
    'ach': 'ACH',
    'ach_push': 'ACH',
    'ach_same_day': 'ACH',
    'arbitrum': 'Arbitrum',
    'avalanche_c_chain': 'Avalanche C-Chain',
    'base': 'Base',
    'bridge_wallet': 'Bridge Wallet',
    'ethereum': 'Ethereum',
    'optimism': 'Optimism',
    'polygon': 'Polygon',
    'sepa': 'SEPA',
    'solana': 'Solana',
    'spei': 'SPEI',
    'stellar': 'Stellar',
    'swift': 'SWIFT',
    'tron': 'Tron',
    'wire': 'Wire',
    'bitcoin': 'Bitcoin',
  };
  
  return railMapping[rail.toLowerCase()] || rail;
}

function normalizeCurrency(currency: string): string {
  return currency.toUpperCase();
}

/**
 * Filters the routing table based on source payment rail and currency
 * @param sourceRail - The source payment rail (e.g., 'ethereum', 'base')
 * @param sourceCurrency - The source currency (e.g., 'usdc', 'dai')
 * @returns Array of possible routes
 */
export async function getAvailableRoutes(
  sourceRail: string,
  sourceCurrency: string
): Promise<Route[]> {
  try {
    // Load routing table
    const response = await fetch('/routingTable.json');
    if (!response.ok) {
      console.error('Failed to load routing table');
      return [];
    }
    
    const routingTable: Route[] = await response.json();
    
    // Normalize inputs
    const normalizedRail = normalizeRail(sourceRail);
    const normalizedCurrency = normalizeCurrency(sourceCurrency);
    
    // Filter routes
    const filteredRoutes = routingTable.filter(
      (route) =>
        route.sourceRail === normalizedRail &&
        route.sourceCurrency === normalizedCurrency
    );
    
    return filteredRoutes;
  } catch (error) {
    console.error('Error loading routing table:', error);
    return [];
  }
}

/**
 * Filters the routing table based on source rail type
 * @param sourceRailType - The source rail type (1=Bridge Wallet, 2=Blockchain, 3=Fiat)
 * @returns Array of routes matching the source rail type
 */
export async function getRoutesBySourceRailType(
  sourceRailType: RailType
): Promise<Route[]> {
  try {
    // Load routing table
    const response = await fetch('/routingTable.json');
    if (!response.ok) {
      console.error('Failed to load routing table');
      return [];
    }
    
    const routingTable: Route[] = await response.json();
    
    // Filter routes
    return routingTable.filter(
      (route) => route.sourceRailType === sourceRailType
    );
  } catch (error) {
    console.error('Error loading routing table:', error);
    return [];
  }
}

/**
 * Gets distinct destination rails from filtered routes
 * @param routes - Array of routes from getAvailableRoutes
 * @returns Array of unique destination rail values
 */
export function getDestinationRails(routes: Route[]): string[] {
  const rails = routes.map((route) => route.destinationRail);
  return Array.from(new Set(rails)).sort();
}

/**
 * Gets distinct destination currencies for a specific destination rail
 * @param routes - Array of routes from getAvailableRoutes
 * @param destinationRail - The selected destination rail
 * @returns Array of unique destination currency values
 */
export function getDestinationCurrencies(
  routes: Route[],
  destinationRail: string
): string[] {
  const normalizedRail = normalizeRail(destinationRail);
  const currencies = routes
    .filter((route) => route.destinationRail === normalizedRail)
    .map((route) => route.destinationCurrency);
  return Array.from(new Set(currencies)).sort();
}

/**
 * Converts routing table rail format back to API format
 * @param rail - Rail in routing table format (e.g., 'Avalanche C-Chain')
 * @returns Rail in API format (e.g., 'avalanche_c_chain')
 */
export function railToApiFormat(rail: string): string {
  const reverseMapping: Record<string, string> = {
    'ACH': 'ach',
    'Arbitrum': 'arbitrum',
    'Avalanche C-Chain': 'avalanche_c_chain',
    'Base': 'base',
    'Bridge Wallet': 'bridge_wallet',
    'Ethereum': 'ethereum',
    'Optimism': 'optimism',
    'Polygon': 'polygon',
    'SEPA': 'sepa',
    'Solana': 'solana',
    'SPEI': 'spei',
    'Stellar': 'stellar',
    'SWIFT': 'swift',
    'Tron': 'tron',
    'Wire': 'wire',
    'Bitcoin': 'bitcoin',
    'Pix (Beta)': 'pix',
  };
  
  return reverseMapping[rail] || rail.toLowerCase().replace(/\s+/g, '_');
}
