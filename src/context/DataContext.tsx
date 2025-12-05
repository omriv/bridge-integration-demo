import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { bridgeAPI } from '../services/bridgeAPI';
import { config } from '../config';
import type { Customer, Wallet, LiquidationAddress, WalletTransaction, Transfer, LiquidationHistory } from '../types';

interface WalletData {
  transactions: WalletTransaction[];
  transactionsRaw: unknown;
  transfers: Transfer[];
  transfersRaw: unknown;
  liquidationHistory: LiquidationHistory[];
  liquidationHistoryRaw: unknown;
  liquidationAddresses: LiquidationAddress[];
  lastFetched: number;
}

interface DataContextType {
  customer: Customer | null;
  customers: Customer[];
  currentCustomerId: string;
  wallets: Wallet[];
  walletDataCache: Map<string, WalletData>;
  liquidationAddresses: LiquidationAddress[];
  loading: boolean;
  error: string | null;
  useMock: boolean;
  loadCustomerData: (customerId?: string) => Promise<void>;
  loadCustomers: () => Promise<void>;
  loadWalletData: (walletId: string, walletAddress: string) => Promise<WalletData>;
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
  const [walletDataCache, setWalletDataCache] = useState<Map<string, WalletData>>(new Map());
  const [liquidationAddresses, setLiquidationAddresses] = useState<LiquidationAddress[]>([]);
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
      await loadCustomers();
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);

      // Fetch customer details, wallets, and liquidation addresses in parallel
      const [customerData, walletsData, liquidationData] = await Promise.all([
        bridgeAPI.getCustomer(customerIdToUse),
        bridgeAPI.getCustomerWallets(customerIdToUse),
        bridgeAPI.getLiquidationAddresses(customerIdToUse),
      ]);

      setCustomer(customerData);
      setWallets(walletsData.data);
      setLiquidationAddresses(liquidationData.data);
      
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
        await loadCustomers();
      } else {
        setError(errorMessage);
        console.error('Error loading customer data:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [currentCustomerId, customers.length]);

  const loadCustomers = useCallback(async () => {
    try {
      const customersData = await bridgeAPI.getAllCustomers();
      setCustomers(customersData.data);
    } catch (err) {
      console.error('Error loading customers list:', err);
    }
  }, []);

  const loadWalletData = useCallback(async (walletId: string, walletAddress: string): Promise<WalletData> => {
    // Check if we have cached data
    const cached = walletDataCache.get(walletId);
    if (cached) {
      return cached;
    }

    try {
      setLoading(true);

      // Filter liquidation addresses for this wallet
      const filteredLiquidation = liquidationAddresses.filter(
        (la) => la.destination_address.toLowerCase() === walletAddress.toLowerCase()
      );

      // Fetch wallet transactions (handle 404 gracefully)
      let walletTxResponse;
      try {
        walletTxResponse = await bridgeAPI.getWalletTransactions(walletId);
      } catch (error) {
        console.log('No wallet transactions found or endpoint not available');
        walletTxResponse = { count: 0, data: [] };
      }

      // Fetch transfers
      const transfersResponse = await bridgeAPI.getTransfers(config.customerId);

      // Fetch liquidation history for all liquidation addresses
      const liquidationHistoryPromises = filteredLiquidation.map((la) =>
        bridgeAPI.getLiquidationHistory(la.customer_id, la.id).catch(() => ({ count: 0, data: [] }))
      );
      const liquidationHistoryResponses = await Promise.all(liquidationHistoryPromises);

      // Combine and sort by date
      const allLiquidationHistory = liquidationHistoryResponses
        .flatMap((response) => response.data)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      const walletData: WalletData = {
        transactions: walletTxResponse.data,
        transactionsRaw: walletTxResponse,
        transfers: transfersResponse.data,
        transfersRaw: transfersResponse,
        liquidationHistory: allLiquidationHistory,
        liquidationHistoryRaw: {
          count: allLiquidationHistory.length,
          data: allLiquidationHistory,
          responses: liquidationHistoryResponses
        },
        liquidationAddresses: filteredLiquidation,
        lastFetched: Date.now(),
      };

      // Cache the data
      setWalletDataCache(prev => new Map(prev).set(walletId, walletData));

      return walletData;
    } finally {
      setLoading(false);
    }
  }, [liquidationAddresses, walletDataCache]);

  const refreshAll = useCallback(async () => {
    // Clear cache
    setWalletDataCache(new Map());
    // Reload customer data and customers list
    await Promise.all([
      loadCustomerData(),
      loadCustomers(),
    ]);
  }, [loadCustomerData, loadCustomers]);

  const toggleMock = useCallback(() => {
    const newUseMock = !useMock;
    setUseMock(newUseMock);
    localStorage.setItem('useMock', String(newUseMock));
    
    // Clear all cached data when switching modes
    setWalletDataCache(new Map());
    setCustomer(null);
    setWallets([]);
    setLiquidationAddresses([]);
    setCustomers([]);
    
    // Reload data with new mode
    setTimeout(() => {
      loadCustomerData();
    }, 100);
  }, [useMock, loadCustomerData]);

  return (
    <DataContext.Provider
      value={{
        customer,
        customers,
        currentCustomerId,
        wallets,
        walletDataCache,
        liquidationAddresses,
        loading,
        error,
        useMock,
        loadCustomerData,
        loadCustomers,
        loadWalletData,
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
