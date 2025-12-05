import { config } from '../config';
import type { 
  Customer,
  CustomersResponse,
  WalletsResponse, 
  LiquidationAddressesResponse,
  WalletTransactionsResponse,
  TransfersResponse,
  LiquidationHistoryResponse
} from '../types';

const headers = {
  'Content-Type': 'application/json',
};

export const bridgeAPI = {
  async getAllCustomers(): Promise<CustomersResponse> {
    const response = await fetch(`${config.baseUrl}/customers`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch customers: ${response.statusText}`);
    }

    return response.json();
  },

  async getCustomer(customerId: string): Promise<Customer> {
    const response = await fetch(`${config.baseUrl}/customers/${customerId}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch customer: ${response.statusText}`);
    }

    return response.json();
  },

  async getCustomerWallets(customerId: string): Promise<WalletsResponse> {
    const response = await fetch(`${config.baseUrl}/wallets?customer_id=${customerId}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch wallets: ${response.statusText}`);
    }

    return response.json();
  },

  async getLiquidationAddresses(customerId: string): Promise<LiquidationAddressesResponse> {
    const response = await fetch(`${config.baseUrl}/liquidation-addresses?customer_id=${customerId}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch liquidation addresses: ${response.statusText}`);
    }

    return response.json();
  },

  async getWalletTransactions(walletId: string): Promise<WalletTransactionsResponse> {
    const response = await fetch(`${config.baseUrl}/wallets/${walletId}/transactions`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch wallet transactions: ${response.statusText}`);
    }

    return response.json();
  },

  async getTransfers(customerId: string): Promise<TransfersResponse> {
    const response = await fetch(`${config.baseUrl}/transfers?customer_id=${customerId}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch transfers: ${response.statusText}`);
    }

    return response.json();
  },

  async getLiquidationHistory(customerId: string, liquidationAddressId: string): Promise<LiquidationHistoryResponse> {
    const response = await fetch(`${config.baseUrl}/customers/${customerId}/liquidation_addresses/${liquidationAddressId}/drains`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch liquidation history: ${response.statusText}`);
    }

    return response.json();
  },
};
