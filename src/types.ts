// TypeScript types for Bridge API responses

export interface Customer {
  id: string;
  type: string;
  status?: string;
  email?: string;
  kyc_status?: string;
  tos_status?: string;
  created_at: string;
  kyc_link?: string;
  tos_link?: string;
  full_name?: string;
  [key: string]: unknown;
}

export interface CustomersResponse {
  count: number;
  data: Customer[];
}

export interface WalletBalance {
  balance: string;
  currency: string;
  chain: string;
  contract_address: string;
}

export interface Wallet {
  id: string;
  customer_id: string;
  chain: string;
  address: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  balances: WalletBalance[];
}

export interface WalletsResponse {
  count: number;
  data: Wallet[];
}

export interface LiquidationAddress {
  id: string;
  chain: string;
  address: string;
  currency: string;
  customer_id: string;
  destination_payment_rail: string;
  destination_currency: string;
  destination_address: string;
  created_at: string;
  updated_at: string;
  state: string;
}

export interface LiquidationAddressesResponse {
  count: number;
  data: LiquidationAddress[];
}

// Transaction types
export interface WalletTransaction {
  amount: string;
  developer_fee: string;
  created_at: string;
  updated_at: string;
  customer_id: string;
  source: {
    currency: string;
    payment_rail: string;
  };
  destination: {
    currency: string;
    payment_rail: string;
  };
}

export interface WalletTransactionsResponse {
  count: number;
  data: WalletTransaction[];
}

export interface Transfer {
  id: string;
  client_reference_id: string | null;
  state: string;
  on_behalf_of: string;
  currency: string;
  amount: string;
  developer_fee: string;
  source: {
    payment_rail: string;
    currency: string;
    from_address?: string;
    bridge_wallet_id?: string;
  };
  created_at: string;
  updated_at: string;
  destination: {
    payment_rail: string;
    currency: string;
    to_address: string;
  };
  source_deposit_instructions?: {
    payment_rail: string;
    amount: string;
    currency: string;
    from_address: string;
    to_address: string;
  };
  receipt: {
    initial_amount: string;
    developer_fee: string;
    exchange_fee?: string;
    subtotal_amount: string;
    gas_fee?: string;
    final_amount?: string;
    url?: string;
    destination_tx_hash?: string;
  };
  developer_fee_percent?: string;
}

export interface TransfersResponse {
  count: number;
  data: Transfer[];
}

export interface LiquidationHistory {
  id: string;
  customer_id: string;
  liquidation_address_id: string;
  amount: string;
  currency: string;
  state: string;
  created_at: string;
  updated_at: string;
  destination: {
    payment_rail: string;
    currency: string;
    to_address: string;
  };
  source_payment_rail: string;
  destination_tx_hash: string;
  deposit_tx_hash: string;
  deposit_tx_timestamp: string;
  from_address: string;
  receipt: {
    initial_amount: string;
    developer_fee: string;
    subtotal_amount: string;
    exchange_rate: string;
    converted_amount: string;
    destination_currency: string;
    outgoing_amount: string;
    url: string;
  };
}

export interface LiquidationHistoryResponse {
  count: number;
  data: LiquidationHistory[];
}
