// TypeScript types for Bridge API responses

export enum RailType {
  BridgeWallet = 1,
  Blockchain = 2,
  Fiat = 3
}

export interface Endorsement {
  name: string;
  status: string;
  requirements: {
    complete: string[];
    pending: string[];
    missing: Record<string, unknown> | null;
    issues: unknown[];
  };
  additional_requirements?: string[];
}

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
  first_name?: string;
  last_name?: string;
  full_name?: string;
  endorsements?: Endorsement[];
  requirements_due?: string[];
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
    to_address?: string;
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

export interface VirtualAccountSourceDepositInstructions {
  currency: string;
  payment_rails: string[];
  bank_name: string;
  bank_address: string;
  bank_beneficiary_name: string;
  bank_beneficiary_address: string;
  bank_account_number: string;
  bank_routing_number: string;
}

export interface VirtualAccountDestination {
  currency: string;
  payment_rail: string;
  address: string;
}

export interface VirtualAccount {
  id: string;
  status: string;
  developer_fee_percent: string;
  customer_id: string;
  created_at: string;
  source_deposit_instructions: VirtualAccountSourceDepositInstructions;
  destination: VirtualAccountDestination;
}

export interface VirtualAccountsResponse {
  count: number;
  data: VirtualAccount[];
}

export interface CreateVirtualAccountRequest {
  source: {
    currency: string;
    payment_rail: string;
  };
  destination: {
    currency: string;
    payment_rail: string;
    to_address?: string;
    bridge_wallet_id?: string;
  };
}

export interface VirtualAccountActivity {
  id: string;
  event_type: string;
  virtual_account_id: string;
  deposit_id?: string;
  amount?: string;
  currency?: string;
  created_at: string;
  updated_at?: string;
  tx_hash?: string;
  from_address?: string;
  to_address?: string;
  payment_rail?: string;
  state?: string;
  developer_fee_amount?: string;
  destination_tx_hash?: string;
  destination_payment_rail?: string;
  sender_name?: string;
  source?: {
    payment_rail?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface VirtualAccountActivityResponse {
  count: number;
  data: VirtualAccountActivity[];
}

export interface ExternalAccount {
  id: string;
  object: 'external_account';
  customer_id: string;
  currency: string;
  account_owner_name?: string;
  bank_name?: string;
  type: string;
  account_number?: string;
  routing_number?: string;
  iban?: string;
  clabe?: string;
  swift_code?: string;
  address?: {
    street_line_1?: string;
    street_line_2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

export interface ExternalAccountsResponse {
  count: number;
  data: ExternalAccount[];
}
