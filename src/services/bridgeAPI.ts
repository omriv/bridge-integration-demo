import { config } from '../config';
import type { 
  Customer,
  Wallet,
  CustomersResponse,
  WalletsResponse, 
  LiquidationAddressesResponse,
  WalletTransactionsResponse,
  TransfersResponse,
  LiquidationHistoryResponse,
  VirtualAccountsResponse,
  VirtualAccountActivityResponse,
  ExternalAccountsResponse,
  CreateVirtualAccountRequest
} from '../types';

type Environment = 'sandbox' | 'qa';

class BridgeAPI {
  private environment: Environment = 'sandbox';

  constructor() {
    // Initialize from localStorage if available
    const stored = localStorage.getItem('bridgeEnvironment') as Environment;
    if (stored) {
      this.environment = stored;
    }
  }

  setEnvironment(env: Environment) {
    this.environment = env;
    localStorage.setItem('bridgeEnvironment', env);
  }

  getEnvironment(): Environment {
    return this.environment;
  }

  private get headers() {
    return {
      'Content-Type': 'application/json',
    };
  }

  private buildUrl(path: string) {
    const separator = path.includes('?') ? '&' : '?';
    return `${config.baseUrl}${path}${separator}env=${this.environment}`;
  }
  async getAllCustomers(email?: string): Promise<CustomersResponse> {
    let path = '/customers';
    if (email) {
      path += `?email=${encodeURIComponent(email)}`;
    }
    
    const response = await fetch(this.buildUrl(path), {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch customers: ${response.statusText}`);
    }

    return response.json();
  }

  async getCustomer(customerId: string): Promise<Customer> {
    const response = await fetch(this.buildUrl(`/customers/${customerId}`), {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch customer: ${response.statusText}`);
    }

    return response.json();
  }

  async getCustomerWallets(customerId: string): Promise<WalletsResponse> {
    const response = await fetch(this.buildUrl(`/wallets?customer_id=${customerId}`), {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch wallets: ${response.statusText}`);
    }

    return response.json();
  }

  async getWallet(customerId: string, walletId: string): Promise<Wallet> {
    const response = await fetch(this.buildUrl(`/customers/${customerId}/wallets/${walletId}`), {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch wallet: ${response.statusText}`);
    }

    return response.json();
  }

  async getLiquidationAddresses(customerId: string, limit: number = 10, startingAfter?: string): Promise<LiquidationAddressesResponse> {
    let path = `/liquidation-addresses?customer_id=${customerId}&limit=${limit}`;
    
    if (startingAfter !== undefined) {
      path += `&starting_after=${startingAfter}`;
    }
    
    const response = await fetch(this.buildUrl(path), {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch liquidation addresses: ${response.statusText}`);
    }

    return response.json();
  }

  async getWalletTransactions(walletId: string, limit: number = 10): Promise<WalletTransactionsResponse> {
    const response = await fetch(this.buildUrl(`/wallets/${walletId}/transactions?limit=${limit}`), {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch wallet transactions: ${response.statusText}`);
    }

    return response.json();
  }

  async getTransfers(customerId: string, limit: number = 10, startingAfter?: string): Promise<TransfersResponse> {
    let path = `/transfers?customer_id=${customerId}&limit=${limit}`;
    
    if (startingAfter !== undefined) {
      path += `&starting_after=${startingAfter}`;
    }
    
    const response = await fetch(this.buildUrl(path), {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch transfers: ${response.statusText}`);
    }

    return response.json();
  }

  async getLiquidationHistory(customerId: string, liquidationAddressId: string, limit: number = 10): Promise<LiquidationHistoryResponse> {
    const response = await fetch(this.buildUrl(`/customers/${customerId}/liquidation_addresses/${liquidationAddressId}/drains?limit=${limit}`), {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch liquidation history: ${response.statusText}`);
    }

    return response.json();
  }

  async getVirtualAccounts(customerId: string): Promise<VirtualAccountsResponse> {
    const response = await fetch(this.buildUrl(`/customers/${customerId}/virtual_accounts`), {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch virtual accounts: ${response.statusText}`);
    }

    return response.json();
  }

  async getVirtualAccountActivity(customerId: string, virtualAccountId: string, limit: number = 10): Promise<VirtualAccountActivityResponse> {
    const response = await fetch(this.buildUrl(`/customers/${customerId}/virtual_accounts/${virtualAccountId}/history?limit=${limit}`), {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch virtual account activity: ${response.statusText}`);
    }

    return response.json();
  }

  async getExternalAccounts(customerId: string, limit: number = 10, startingAfter?: string): Promise<ExternalAccountsResponse> {
    let path = `/customers/${customerId}/external_accounts?limit=${limit}`;
    
    if (startingAfter !== undefined) {
      path += `&starting_after=${startingAfter}`;
    }
    
    const response = await fetch(this.buildUrl(path), {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch external accounts: ${response.statusText}`);
    }

    return response.json();
  }

  async createTransfer(transferData: Record<string, unknown>): Promise<unknown> {
    const response = await fetch(this.buildUrl('/transfers'), {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(transferData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(JSON.stringify(errorData));
    }

    return response.json();
  }

  async createWallet(customerId: string, walletData: Record<string, unknown>): Promise<unknown> {
    const response = await fetch(this.buildUrl(`/customers/${customerId}/wallets`), {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(walletData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(JSON.stringify(errorData));
    }

    return response.json();
  }

  async createExternalAccount(customerId: string, accountData: Record<string, unknown>): Promise<unknown> {
    const response = await fetch(this.buildUrl(`/customers/${customerId}/external_accounts`), {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(accountData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(JSON.stringify(errorData));
    }

    return response.json();
  }

  async createVirtualAccount(customerId: string, accountData: CreateVirtualAccountRequest): Promise<unknown> {
    const response = await fetch(this.buildUrl(`/customers/${customerId}/virtual_accounts`), {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(accountData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(JSON.stringify(errorData));
    }

    return response.json();
  }

  async createLiquidationAddress(customerId: string, addressData: Record<string, unknown>): Promise<unknown> {
    const response = await fetch(this.buildUrl(`/customers/${customerId}/liquidation_addresses`), {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(addressData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(JSON.stringify(errorData));
    }

    return response.json();
  }

  async deleteCustomer(customerId: string): Promise<unknown> {
    const response = await fetch(this.buildUrl(`/customers/${customerId}`), {
      method: 'DELETE',
      headers: this.headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(JSON.stringify(errorData));
    }

    return response.json();
  }

  async createCustomer(customerData: Record<string, unknown>): Promise<unknown> {
    const response = await fetch(this.buildUrl('/customers'), {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(customerData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(JSON.stringify(errorData));
    }

    return response.json();
  }

  async getTosLink(customerId: string): Promise<{ url: string }> {
    const response = await fetch(this.buildUrl(`/customers/${customerId}/tos_link`), {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(JSON.stringify(errorData));
    }

    return response.json();
  }
}

// Export singleton instance
export const bridgeAPI = new BridgeAPI();
