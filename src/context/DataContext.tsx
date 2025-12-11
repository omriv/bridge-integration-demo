import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { bridgeAPI } from '../services/bridgeAPI';
import { config } from '../config';
import type { Customer, Wallet, LiquidationAddress, WalletTransaction, Transfer, LiquidationHistory, VirtualAccount, VirtualAccountActivity, ExternalAccount } from '../types';

// ============================================================================
// INDIVIDUAL FETCH FUNCTIONS (No State Updates - Pure Data Fetching)
// ============================================================================

/**
 * Fetches a single customer by ID
 * @returns Customer object or throws error
 */
async function fetchCustomer(customerId: string): Promise<Customer> {
  const response = await bridgeAPI.getCustomer(customerId);
  return response;
}

/**
 * Fetches all customers
 * @returns Array of customers
 */
export async function fetchAllCustomers(): Promise<Customer[]> {
  const response = await bridgeAPI.getAllCustomers();
  return response.data;
}

/**
 * Fetches all wallets for a customer
 * @returns Array of wallets
 */
async function fetchCustomerWallets(customerId: string): Promise<Wallet[]> {
  const response = await bridgeAPI.getCustomerWallets(customerId);
  return response.data;
}

/**
 * Fetches a single wallet by ID
 * @returns Wallet object or throws error
 */
async function fetchWallet(customerId: string, walletId: string): Promise<Wallet> {
  const response = await bridgeAPI.getWallet(customerId, walletId);
  return response;
}

/**
 * Fetches liquidation addresses for a customer
 * @param limit - Maximum number of addresses to fetch
 * @returns Array of liquidation addresses
 */
async function fetchCustomerLiquidationAddresses(customerId: string, limit: number = 50): Promise<LiquidationAddress[]> {
  const response = await bridgeAPI.getLiquidationAddresses(customerId, limit);
  return response.data;
}

/**
 * Fetches wallet transactions
 * @param limit - Maximum number of transactions to fetch
 * @returns Wallet transactions response with data and raw response
 */
async function fetchWalletTransactions(
  walletId: string, 
  limit: number = 10
): Promise<{ data: WalletTransaction[]; raw: unknown }> {
  try {
    const response = await bridgeAPI.getWalletTransactions(walletId, limit);
    return { data: response.data, raw: response };
  } catch (error) {
    console.log('No wallet transactions found or endpoint not available');
    return { data: [], raw: { count: 0, data: [] } };
  }
}

/**
 * Fetches liquidation history for a single address
 * @param limit - Maximum number of history records
 */
async function fetchLiquidationHistory(
  customerId: string,
  liquidationAddressId: string,
  limit: number = 10
): Promise<{ data: LiquidationHistory[]; raw: unknown }> {
  try {
    const response = await bridgeAPI.getLiquidationHistory(customerId, liquidationAddressId, limit);
    return { data: response.data, raw: response };
  } catch (error) {
    console.error(`Error fetching liquidation history for address ${liquidationAddressId}:`, error);
    return { data: [], raw: { count: 0, data: [] } };
  }
}

/**
 * Fetches virtual account activity for a single account
 * @param limit - Maximum number of activity records
 */
async function fetchVirtualAccountActivity(
  customerId: string,
  virtualAccountId: string,
  limit: number = 10
): Promise<{ data: VirtualAccountActivity[]; raw: unknown }> {
  try {
    const response = await bridgeAPI.getVirtualAccountActivity(customerId, virtualAccountId, limit);
    return { data: response.data, raw: response };
  } catch (error) {
    console.error(`Error fetching VA activity for account ${virtualAccountId}:`, error);
    return { data: [], raw: { count: 0, data: [] } };
  }
}

/**
 * Fetches virtual accounts for a customer
 */
export async function fetchVirtualAccounts(customerId: string): Promise<VirtualAccount[]> {
  try {
    const response = await bridgeAPI.getVirtualAccounts(customerId);
    return response.data;
  } catch (error) {
    console.error('Error fetching virtual accounts:', error);
    return [];
  }
}

/**
 * Fetches external accounts (bank accounts) for a customer
 */
export async function fetchExternalAccounts(customerId: string, limit: number = 50): Promise<ExternalAccount[]> {
  try {
    const response = await bridgeAPI.getExternalAccounts(customerId, limit);
    return response.data;
  } catch (error) {
    console.error('Error fetching external accounts:', error);
    return [];
  }
}

// ============================================================================
// PROGRESSIVE FETCH FUNCTIONS (Multi-Page Fetching)
// ============================================================================

/**
 * Progressively fetches transfers until we have enough filtered results
 * Uses updated_before_ms to paginate through results
 * 
 * NOTE: This is a workaround for the API not supporting wallet-based filtering.
 * Fetches customer's transfers in pages until enough match the wallet filter.
 * 
 * @param customerId - Customer ID
 * @param limit - Target number of filtered results
 * @param filterFn - Optional function to filter transfers (e.g., by wallet)
 * @returns Object with filtered data and raw responses
 */
async function fetchTransfersProgressive(
  customerId: string,
  limit: number,
  filterFn?: (transfers: Transfer[]) => Transfer[]
): Promise<{ data: Transfer[]; raw: unknown }> {
  let filteredTransfers: Transfer[] = [];
  let startingAfter: string | undefined = undefined;
  let fetchCount = 0;
  const maxFetches = 10; // Safety limit to prevent infinite loops
  while (fetchCount < maxFetches) {
    fetchCount++;
    
    const response = await bridgeAPI.getTransfers(customerId, limit, startingAfter);
    const fetchedTransfers = response.data;
    
    // Apply filter if provided
    filteredTransfers = [...filteredTransfers, ...(filterFn ? filterFn(fetchedTransfers) : fetchedTransfers)];
    
    // Exit conditions:
    // 1. Fetched fewer items than limit (reached end of data)
    // 2. Have enough filtered results
    if (fetchedTransfers.length < limit || filteredTransfers.length >= limit) {
      break;
    }
    
    // Prepare for next page
    if (fetchedTransfers.length > 0) {
      const lastItem = fetchedTransfers[fetchedTransfers.length - 1];
      startingAfter = lastItem.id;
    } else {
      break; // No more data
    }
  }
  
  return {
    data: filteredTransfers.slice(0, limit),
    raw: {
      count: filteredTransfers.slice(0, limit).length,
      data: filteredTransfers.slice(0, limit),
      fetchCount
    }
  };
}

async function fetchWalletLiquidationAddressesProgressive(
  customerId: string,
  limit: number,
  filterFn?: (liquidationAddresses: LiquidationAddress[]) => LiquidationAddress[]
): Promise<LiquidationAddress[]> {
  let filteredLiquidationAddresses: LiquidationAddress[] = [];
  let startingAfter: string | undefined = undefined;
  let fetchCount = 0;
  const maxFetches = 10; // Safety limit to prevent infinite loops
  while (fetchCount < maxFetches) {
    fetchCount++;
    
    const response = await bridgeAPI.getLiquidationAddresses(customerId, limit, startingAfter);
    const fetchedLiquidationAddresses = response.data;
    
    // Apply filter if provided
    filteredLiquidationAddresses = [...filteredLiquidationAddresses, ...(filterFn ? filterFn(fetchedLiquidationAddresses) : fetchedLiquidationAddresses)];
    
    // Exit conditions:
    // 1. Fetched fewer items than limit (reached end of data)
    if (fetchedLiquidationAddresses.length < limit) {
      break;
    }
    
    // Prepare for next page
    if (fetchedLiquidationAddresses.length > 0) {
      const lastItem = fetchedLiquidationAddresses[fetchedLiquidationAddresses.length - 1];
      startingAfter = lastItem.id;
    } else {
      break; // No more data
    }
  }
  
  return filteredLiquidationAddresses;
}

// ============================================================================
// PARALLEL FETCH FUNCTIONS (Fetch Multiple Resources Concurrently)
// ============================================================================

/**
 * Fetches liquidation history for multiple addresses in parallel
 * @param addresses - Array of liquidation addresses
 * @param limit - Maximum history records per address
 * @returns Combined and sorted liquidation history
 */
async function fetchLiquidationHistoryParallel(
  addresses: LiquidationAddress[],
  limit: number = 10
): Promise<{ data: LiquidationHistory[]; raw: unknown }> {
  if (addresses.length === 0) {
    return { data: [], raw: { count: 0, data: [], responses: [] } };
  }
  
  // Fetch all addresses in parallel
  const historyPromises = addresses.map((address) =>
    fetchLiquidationHistory(address.customer_id, address.id, limit)
  );
  
  const results = await Promise.all(historyPromises);
  
  // Combine all results and sort by created_at
  const allHistory = results
    .flatMap((result) => result.data)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  return {
    data: allHistory,
    raw: {
      count: allHistory.length,
      data: allHistory,
      responses: results.map(r => r.raw)
    }
  };
}

/**
 * Fetches virtual account activity for multiple accounts in parallel
 * @param customerId - Customer ID
 * @param accounts - Array of virtual accounts
 * @param limit - Maximum activity records per account
 * @returns Combined and sorted activity
 */
async function fetchVirtualAccountActivityParallel(
  customerId: string,
  accounts: VirtualAccount[],
  limit: number = 10
): Promise<{ data: VirtualAccountActivity[]; raw: unknown }> {
  if (accounts.length === 0) {
    return { data: [], raw: { count: 0, data: [], responses: [] } };
  }
  
  // Fetch all accounts in parallel
  const activityPromises = accounts.map((account) =>
    fetchVirtualAccountActivity(customerId, account.id, limit)
  );
  
  const results = await Promise.all(activityPromises);
  
  // Combine all results and sort by created_at
  const allActivity = results
    .flatMap((result) => result.data)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  return {
    data: allActivity,
    raw: {
      count: allActivity.length,
      data: allActivity,
      responses: results.map(r => r.raw)
    }
  };
}


interface DataContextType {
  // State
  customer: Customer | null;
  customers: Customer[];
  currentCustomerId: string;
  wallets: Wallet[];
  liquidationAddresses: LiquidationAddress[];
  virtualAccounts: VirtualAccount[];
  externalAccounts: ExternalAccount[];
  virtualAccountsLoading: boolean;
  loading: boolean;
  error: string | null;
  useMock: boolean;
  
  // Individual Fetch Functions (No state updates)
  fetchWallet: (customerId: string, walletId: string) => Promise<Wallet>;
  fetchWalletTransactions: (walletId: string, limit?: number) => Promise<{ data: WalletTransaction[]; raw: unknown }>;
  fetchTransfersProgressive: (customerId: string, limit: number, filterFn?: (transfers: Transfer[]) => Transfer[]) => Promise<{ data: Transfer[]; raw: unknown }>;
  fetchCustomerLiquidationAddresses: (customerId: string, limit?: number) => Promise<LiquidationAddress[]>;
  fetchWalletLiquidationAddressesProgressive: (customerId: string, limit: number, filterFn?: (liquidationAddresses: LiquidationAddress[]) => LiquidationAddress[]) => Promise<LiquidationAddress[]>;
  fetchLiquidationHistoryParallel: (addresses: LiquidationAddress[], limit?: number) => Promise<{ data: LiquidationHistory[]; raw: unknown }>;
  fetchVirtualAccountActivityParallel: (customerId: string, accounts: VirtualAccount[], limit?: number) => Promise<{ data: VirtualAccountActivity[]; raw: unknown }>;
  fetchExternalAccounts: (customerId: string, limit?: number) => Promise<ExternalAccount[]>;
  createExternalAccount: (customerId: string, accountData: Record<string, unknown>) => Promise<unknown>;
  createWallet: (customerId: string, walletData: Record<string, unknown>) => Promise<unknown>;
  
  // Composite Functions (With state updates)
  loadCustomerData: (customerId?: string) => Promise<void>;
  loadCustomers: () => Promise<void>;
  
  // Utility Functions
  setCurrentCustomerId: (customerId: string) => void;
  toggleMock: () => void;
  refreshAll: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [currentCustomerId, setCurrentCustomerId] = useState<string>(config.customerId);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [liquidationAddresses, setLiquidationAddresses] = useState<LiquidationAddress[]>([]);
  const [virtualAccounts, setVirtualAccounts] = useState<VirtualAccount[]>([]);
  const [externalAccounts, setExternalAccounts] = useState<ExternalAccount[]>([]);
  const [virtualAccountsLoading, setVirtualAccountsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Mock mode state - initialize from localStorage or config
  const [useMock, setUseMock] = useState<boolean>(() => {
    const stored = localStorage.getItem('useMock');
    return stored !== null ? stored === 'true' : config.useMock;
  });

  const loadCustomerData = useCallback(async (customerId?: string) => {
    const customerIdToUse = customerId || currentCustomerId;
    
    // Skip if no valid customer ID provided
    if (!customerIdToUse || customerIdToUse === 'your-customer-id-here') {
      console.log('No valid customer ID, loading customers list...');
      setCustomer(null);
      setWallets([]);
      setLiquidationAddresses([]);
      setVirtualAccounts([]);
      setExternalAccounts([]);
      await loadCustomers();
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setVirtualAccountsLoading(true);
      setError(null);

      // Fetch customer details, wallets, liquidation addresses, and virtual accounts in parallel
      const [customerData, walletsData, liquidationData, virtualAccountsData, externalAccountsData] = await Promise.all([
        fetchCustomer(customerIdToUse),
        fetchCustomerWallets(customerIdToUse),
        fetchCustomerLiquidationAddresses(customerIdToUse),
        fetchVirtualAccounts(customerIdToUse),
        fetchExternalAccounts(customerIdToUse)
      ]);

      setCustomer(customerData);
      setWallets(walletsData);
      setLiquidationAddresses(liquidationData);
      setVirtualAccounts(virtualAccountsData);
      setExternalAccounts(externalAccountsData);
      
      // Load customers list in background after initial data loads
      if (customers.length === 0) {
        loadCustomers();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      
      // If customer not found (404), load customers list instead of showing error
      if (errorMessage.includes('404') || errorMessage.includes('Not Found') || errorMessage.includes('Failed to fetch customer')) {
        console.log('Customer not found, loading customers list...');
        setCustomer(null);
        setWallets([]);
        setLiquidationAddresses([]);
        setVirtualAccounts([]);
        setExternalAccounts([]);
        await loadCustomers();
      } else {
        setError(errorMessage);
        console.error('Error loading customer data:', err);
        setVirtualAccounts([]);
        setExternalAccounts([]);
      }
    } finally {
      setLoading(false);
      setVirtualAccountsLoading(false);
    }
  }, [currentCustomerId, customers.length]);

  const loadCustomers = useCallback(async () => {
    try {
      const customers = await fetchAllCustomers();
      setCustomers(customers);
    } catch (err) {
      console.error('Error loading customers list:', err);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    // Reload customer data and customers list
    await Promise.all([
      loadCustomerData(),
      loadCustomers(),
    ]);
  }, [loadCustomerData, loadCustomers]);

  const createExternalAccount = useCallback(async (customerId: string, accountData: Record<string, unknown>) => {
    const result = await bridgeAPI.createExternalAccount(customerId, accountData);
    // Refresh external accounts after creation
    const updatedAccounts = await fetchExternalAccounts(customerId);
    setExternalAccounts(updatedAccounts);
    return result;
  }, []);

  const createWallet = useCallback(async (customerId: string, walletData: Record<string, unknown>) => {
    const result = await bridgeAPI.createWallet(customerId, walletData);
    // Refresh wallets after creation
    const updatedWallets = await fetchCustomerWallets(customerId);
    setWallets(updatedWallets);
    return result;
  }, []);

  const toggleMock = useCallback(() => {
    const newUseMock = !useMock;
    setUseMock(newUseMock);
    localStorage.setItem('useMock', String(newUseMock));
    
    // Clear all cached data when switching modes
    setCustomer(null);
    setWallets([]);
    setLiquidationAddresses([]);
    setVirtualAccounts([]);
    setExternalAccounts([]);
    setCustomers([]);
    
    // Reload data with new mode
    setTimeout(() => {
      loadCustomerData();
    }, 100);
  }, [useMock, loadCustomerData]);

  return (
    <DataContext.Provider
      value={{
        // State
        customer,
        customers,
        currentCustomerId,
        wallets,
        liquidationAddresses,
        virtualAccounts,
        externalAccounts,
        virtualAccountsLoading,
        loading,
        error,
        useMock,
        
        // Individual Fetch Functions
        fetchWallet,
        fetchWalletTransactions,
        fetchTransfersProgressive,
        fetchCustomerLiquidationAddresses,
        fetchWalletLiquidationAddressesProgressive,
        fetchLiquidationHistoryParallel,
        fetchVirtualAccountActivityParallel,
        fetchExternalAccounts,
        createExternalAccount,
        createWallet,
        
        // Composite Functions
        loadCustomerData,
        loadCustomers,
        
        // Utility Functions
        setCurrentCustomerId,
        toggleMock,
        refreshAll,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
