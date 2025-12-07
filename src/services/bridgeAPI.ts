import { config, getBaseUrl } from '../config';
import type { 
  Customer,
  CustomersResponse,
  WalletsResponse, 
  LiquidationAddressesResponse,
  WalletTransactionsResponse,
  TransfersResponse,
  LiquidationHistoryResponse,
  VirtualAccountsResponse,
  VirtualAccountActivityResponse
} from '../types';

const headers = {
  'Content-Type': 'application/json',
};

// Helper to get current base URL (supports dynamic mock toggling)
const getCurrentBaseUrl = () => {
  // Check localStorage for useMock preference
  const storedUseMock = localStorage.getItem('useMock');
  const useMock = storedUseMock !== null ? storedUseMock === 'true' : config.useMock;
  return getBaseUrl(useMock);
};

export const bridgeAPI = {
  async getAllCustomers(): Promise<CustomersResponse> {
    const response = await fetch(`${getCurrentBaseUrl()}/customers`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch customers: ${response.statusText}`);
    }

    return response.json();
  },

  async getCustomer(customerId: string): Promise<Customer> {
    const response = await fetch(`${getCurrentBaseUrl()}/customers/${customerId}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch customer: ${response.statusText}`);
    }

    return response.json();
  },

  async getCustomerWallets(customerId: string): Promise<WalletsResponse> {
    const response = await fetch(`${getCurrentBaseUrl()}/wallets?customer_id=${customerId}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch wallets: ${response.statusText}`);
    }

    return response.json();
  },

  async getLiquidationAddresses(customerId: string, limit: number = 10): Promise<LiquidationAddressesResponse> {
    const response = await fetch(`${getCurrentBaseUrl()}/liquidation-addresses?customer_id=${customerId}&limit=${limit}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch liquidation addresses: ${response.statusText}`);
    }

    return response.json();
  },

  async getWalletTransactions(walletId: string, limit: number = 10): Promise<WalletTransactionsResponse> {
    const response = await fetch(`${getCurrentBaseUrl()}/wallets/${walletId}/transactions?limit=${limit}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch wallet transactions: ${response.statusText}`);
    }

    return response.json();
  },

  async getTransfers(customerId: string, limit: number = 10): Promise<TransfersResponse> {
    const response = await fetch(`${getCurrentBaseUrl()}/transfers?customer_id=${customerId}&limit=${limit}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch transfers: ${response.statusText}`);
    }

    return response.json();
  },

  async getLiquidationHistory(customerId: string, liquidationAddressId: string, limit: number = 10): Promise<LiquidationHistoryResponse> {
    const response = await fetch(`${getCurrentBaseUrl()}/customers/${customerId}/liquidation_addresses/${liquidationAddressId}/drains?limit=${limit}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch liquidation history: ${response.statusText}`);
    }

    return response.json();
  },

  async getVirtualAccounts(customerId: string): Promise<VirtualAccountsResponse> {
    const response = await fetch(`${getCurrentBaseUrl()}/customers/${customerId}/virtual_accounts`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch virtual accounts: ${response.statusText}`);
    }

    return response.json();
  },

  async getVirtualAccountActivity(customerId: string, virtualAccountId: string, limit: number = 10): Promise<VirtualAccountActivityResponse> {
    const response = await fetch(`${getCurrentBaseUrl()}/customers/${customerId}/virtual_accounts/${virtualAccountId}/history?limit=${limit}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch virtual account activity: ${response.statusText}`);
    }

    return response.json();
  },

  async createTransfer(transferData: Record<string, unknown>): Promise<unknown> {
    const response = await fetch(`${getCurrentBaseUrl()}/transfers`, {
      method: 'POST',
      headers,
      body: JSON.stringify(transferData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(JSON.stringify(errorData));
    }

    return response.json();
  },
};
