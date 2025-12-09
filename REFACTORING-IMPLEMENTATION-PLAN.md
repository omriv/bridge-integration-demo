# Data Fetching Refactoring Implementation Plan
**AUTO-EXECUTABLE INSTRUCTIONS FOR AI AGENT**

**Date:** December 9, 2025  
**Objective:** Eliminate all data fetching duplications, prevent duplicate API calls, centralize all fetching in DataContext, support progressive UI loading

---

## EXECUTION SUMMARY

This document provides exact code changes to implement a complete refactoring of the data fetching architecture. All code blocks are ready to copy-paste. Execute changes in the order specified.

**Key Changes:**
- ✅ Move ALL data fetching to DataContext (remove from WalletOverviewPage)
- ✅ Create individual fetch functions for each HTTP endpoint
- ✅ Create parallel fetch utilities for existing use cases
- ✅ Support progressive UI loading (show data as ready, don't wait for all)
- ✅ Remove all code duplications
- ✅ Remove all debugger statements
- ✅ Remove all unused code

---

## CURRENT STATE ANALYSIS

### Files Analyzed:
1. **server.js** - Express proxy server (9 Bridge API endpoints)
2. **bridgeAPI.ts** - Client API service (9 functions with debuggers)
3. **DataContext.tsx** - Context provider (3 composite functions, no individual fetchers)
4. **WalletOverviewPage.tsx** - Component (5 duplicate data loaders + direct bridgeAPI calls)

### HTTP Endpoints Available:
1. `GET /api/customers` - All customers
2. `GET /api/customers/:customerId` - Single customer
3. `GET /api/wallets?customer_id=X` - Customer's wallets
4. `GET /api/liquidation-addresses?customer_id=X` - Liquidation addresses
5. `GET /api/wallets/:walletId/transactions?limit=X` - Wallet transactions
6. `GET /api/transfers?customer_id=X&limit=X` - Transfers (NO wallet filter - requires client-side filtering)
7. `GET /api/customers/:customerId/liquidation_addresses/:addressId/drains?limit=X` - Liquidation history
8. `GET /api/customers/:customerId/virtual_accounts` - Virtual accounts
9. `GET /api/customers/:customerId/virtual_accounts/:accountId/history?limit=X` - VA activity
10. `POST /api/transfers` - Create transfer

### Code Duplications Found:

#### Duplication #1: Liquidation Addresses Fetch
- **DataContext.tsx line 76:** `bridgeAPI.getLiquidationAddresses(customerIdToUse)`
- **WalletOverviewPage.tsx line 197:** `bridgeAPI.getLiquidationAddresses(customerId)`
- **Impact:** Same data fetched twice on page load

#### Duplication #2: Progressive Transfer Fetching
- **DataContext.tsx line 140:** Simple single call, no progressive logic
- **WalletOverviewPage.tsx lines 131-189:** Full progressive algorithm with pagination
- **Impact:** Algorithm duplicated, DataContext version doesn't support filtering

#### Duplication #3: Parallel Liquidation History Fetch
- **DataContext.tsx lines 143-151:** Parallel fetch with Promise.all, no limit
- **WalletOverviewPage.tsx lines 221-240:** Same pattern with limit support
- **Impact:** Same logic implemented twice

#### Duplication #4: Parallel Virtual Account Activity Fetch
- **WalletOverviewPage.tsx lines 271-290:** Parallel fetch pattern
- **Impact:** Not in DataContext at all, should be

#### Duplication #5: Wallet Fetch
- **DataContext.tsx line 75:** `bridgeAPI.getCustomerWallets(customerIdToUse)`
- **WalletOverviewPage.tsx line 356:** `bridgeAPI.getCustomerWallets(customerId)` when wallet not in context
- **Impact:** Fetches wallets twice when wallet not initially in context

#### Duplication #6: Debugger Statements
- **bridgeAPI.ts:** Lines 27, 38, 51, 64, 77, 89, 108, 121, 134 (9 debuggers)
- **WalletOverviewPage.tsx:** Lines 318, 518 (2 debuggers)
- **Impact:** 11 total debuggers in production code

### Architectural Issues:

#### Issue #1: Component Imports bridgeAPI
**WalletOverviewPage.tsx line 4:** `import { bridgeAPI } from '../services/bridgeAPI';`
- Violates separation of concerns
- Makes 6 direct API calls instead of using context

#### Issue #2: No Individual Fetch Functions in DataContext
- All fetching embedded in composite functions (loadCustomerData, loadWalletData)
- Cannot reuse individual fetches
- Cannot call with different parameters

#### Issue #3: No Progressive Loading Support
- loadAllWalletData waits for all data before returning
- UI cannot show individual sections as they load
- Poor UX for slow connections

#### Issue #4: Unused Code
- **DataContext.tsx:** `loadWalletData` function (lines 116-172) - Never called by WalletOverviewPage
- **DataContext.tsx:** `walletDataCache` state and logic - Not actively used

---

## IMPLEMENTATION PLAN

Execute steps in order. Each step includes exact code to add, change, or delete.

### STEP 1: Remove All Debugger Statements from bridgeAPI.ts

**File:** `src/services/bridgeAPI.ts`

**Action:** Delete 9 debugger statements

**Changes:**

1. In `getAllCustomers` - Remove `debugger;` from line 27
2. In `getCustomer` - Remove `debugger;` from line 38
3. In `getCustomerWallets` - Remove `debugger;` from line 51
4. In `getLiquidationAddresses` - Remove `debugger;` from line 64
5. In `getWalletTransactions` - Remove `debugger;` from line 77
6. In `getTransfers` - Remove `debugger;` from line 89
7. In `getLiquidationHistory` - Remove `debugger;` from line 108
8. In `getVirtualAccounts` - Remove `debugger;` from line 121
9. In `getVirtualAccountActivity` - Remove `debugger;` from line 134

**Verification:** Search for `debugger` in bridgeAPI.ts - should return 0 results

---

### STEP 2: Add Individual Fetch Functions to DataContext.tsx

**File:** `src/context/DataContext.tsx`

**Action:** Add 7 new individual fetch functions AFTER the imports, BEFORE the interface definitions

**Code to Add (insert after line 5, before `interface WalletData`):**

```typescript
import type { VirtualAccount, VirtualAccountActivity } from '../types';

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
async function fetchAllCustomers(): Promise<Customer[]> {
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
 * Fetches liquidation addresses for a customer
 * @param limit - Maximum number of addresses to fetch
 * @returns Array of liquidation addresses
 */
async function fetchLiquidationAddresses(customerId: string, limit: number = 50): Promise<LiquidationAddress[]> {
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
async function fetchVirtualAccounts(customerId: string): Promise<VirtualAccount[]> {
  try {
    const response = await bridgeAPI.getVirtualAccounts(customerId);
    return response.data;
  } catch (error) {
    console.error('Error fetching virtual accounts:', error);
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
  let allTransfers: Transfer[] = [];
  let allResponses: unknown[] = [];
  let updatedBeforeMs = Date.now();
  let fetchCount = 0;
  const maxFetches = 10; // Safety limit to prevent infinite loops
  
  while (fetchCount < maxFetches) {
    fetchCount++;
    
    const response = await bridgeAPI.getTransfers(customerId, limit, updatedBeforeMs);
    const fetchedTransfers = response.data;
    allResponses.push(response);
    
    allTransfers = [...allTransfers, ...fetchedTransfers];
    
    // Apply filter if provided
    const filteredTransfers = filterFn ? filterFn(allTransfers) : allTransfers;
    
    // Exit conditions:
    // 1. Fetched fewer items than limit (reached end of data)
    // 2. Have enough filtered results
    if (fetchedTransfers.length < limit || filteredTransfers.length >= limit) {
      break;
    }
    
    // Prepare for next page
    if (fetchedTransfers.length > 0) {
      const lastItem = fetchedTransfers[fetchedTransfers.length - 1];
      updatedBeforeMs = new Date(lastItem.updated_at).getTime();
    } else {
      break; // No more data
    }
  }
  
  return {
    data: allTransfers,
    raw: {
      count: allTransfers.length,
      data: allTransfers,
      responses: allResponses,
      fetchCount
    }
  };
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

/**
 * Loads initial customer data (customer + wallets + liquidation addresses) in parallel
 * This is a composite function for the common use case of loading a customer's basic data
 */
async function loadCustomerBasicData(customerId: string): Promise<{
  customer: Customer;
  wallets: Wallet[];
  liquidationAddresses: LiquidationAddress[];
}> {
  const [customer, wallets, liquidationAddresses] = await Promise.all([
    fetchCustomer(customerId),
    fetchCustomerWallets(customerId),
    fetchLiquidationAddresses(customerId)
  ]);
  
  return { customer, wallets, liquidationAddresses };
}
```

**Verification:** File should compile without errors. Search for the new functions by name.

---

### STEP 3: Update DataContext Type Interfaces

**File:** `src/context/DataContext.tsx`

**Action:** Update the `DataContextType` interface to expose new fetch functions

**Find:** The `interface DataContextType` definition (around line 18-35)

**Replace with:**

```typescript
interface DataContextType {
  // State
  customer: Customer | null;
  customers: Customer[];
  currentCustomerId: string;
  wallets: Wallet[];
  liquidationAddresses: LiquidationAddress[];
  loading: boolean;
  error: string | null;
  useMock: boolean;
  
  // Individual Fetch Functions (No state updates)
  fetchWalletTransactions: (walletId: string, limit?: number) => Promise<{ data: WalletTransaction[]; raw: unknown }>;
  fetchTransfersProgressive: (customerId: string, limit: number, filterFn?: (transfers: Transfer[]) => Transfer[]) => Promise<{ data: Transfer[]; raw: unknown }>;
  fetchLiquidationAddresses: (customerId: string, limit?: number) => Promise<LiquidationAddress[]>;
  fetchLiquidationHistoryParallel: (addresses: LiquidationAddress[], limit?: number) => Promise<{ data: LiquidationHistory[]; raw: unknown }>;
  fetchVirtualAccountActivityParallel: (customerId: string, accounts: VirtualAccount[], limit?: number) => Promise<{ data: VirtualAccountActivity[]; raw: unknown }>;
  
  // Composite Functions (With state updates)
  loadCustomerData: (customerId?: string) => Promise<void>;
  loadCustomers: () => Promise<void>;
  
  // Utility Functions
  setCurrentCustomerId: (customerId: string) => void;
  toggleMock: () => void;
  refreshAll: () => Promise<void>;
}
```

---

### STEP 4: Remove Unused Code from DataContext

**File:** `src/context/DataContext.tsx`

**Action:** Delete `loadWalletData` function and `walletDataCache` state (unused)

**Delete:**

1. From state (around line 48):
```typescript
const [walletDataCache, setWalletDataCache] = useState<Map<string, WalletData>>(new Map());
```

2. From interface WalletData (around line 7-15) - DELETE THE ENTIRE INTERFACE:
```typescript
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
```

3. The entire `loadWalletData` function (lines 116-172)

4. From refreshAll function, remove cache clearing:
```typescript
setWalletDataCache(new Map());
```

5. From toggleMock function, remove cache clearing:
```typescript
setWalletDataCache(new Map());
```

6. From DataContext.Provider value, remove:
```typescript
walletDataCache,
```
and
```typescript
loadWalletData,
```

**Verification:** Search for `walletDataCache` and `loadWalletData` - should return 0 results

---

### STEP 5: Update DataContext Provider Value

**File:** `src/context/DataContext.tsx`

**Action:** Add new fetch functions to the context provider value

**Find:** The `<DataContext.Provider value={{...}}>` section

**Replace the value prop with:**

```typescript
value={{
  // State
  customer,
  customers,
  currentCustomerId,
  wallets,
  liquidationAddresses,
  loading,
  error,
  useMock,
  
  // Individual Fetch Functions
  fetchWalletTransactions,
  fetchTransfersProgressive,
  fetchLiquidationAddresses,
  fetchLiquidationHistoryParallel,
  fetchVirtualAccountActivityParallel,
  
  // Composite Functions
  loadCustomerData,
  loadCustomers,
  
  // Utility Functions
  setCurrentCustomerId,
  toggleMock,
  refreshAll,
}}
```

---

### STEP 6: Update WalletOverviewPage - Remove bridgeAPI Import

**File:** `src/pages/WalletOverviewPage.tsx`

**Action:** Remove bridgeAPI import and update useData destructuring

**Find (line 4):**
```typescript
import { bridgeAPI } from '../services/bridgeAPI';
```

**Delete this line**

**Find (line 32):**
```typescript
const { wallets, refreshAll, customer, loadCustomerData } = useData();
```

**Replace with:**
```typescript
const { 
  wallets, 
  refreshAll, 
  customer, 
  loadCustomerData, 
  liquidationAddresses,
  fetchWalletTransactions,
  fetchTransfersProgressive,
  fetchLiquidationHistoryParallel,
  fetchVirtualAccountActivityParallel
} = useData();
```

---

### STEP 7: Delete Individual Loader Functions from WalletOverviewPage

**File:** `src/pages/WalletOverviewPage.tsx`

**Action:** Delete 5 loader functions (lines 113-303)

**Delete these functions:**
1. `loadWalletTransactionsData` (lines ~113-132)
2. `loadTransfersData` (lines ~134-192)
3. `loadLiquidationAddressesData` (lines ~194-206)
4. `loadLiquidationHistoryData` (lines ~208-254)
5. `loadVirtualAccountActivityData` (lines ~256-303)

**Verification:** Search for these function names - should return 0 definitions (only calls in JSX)

---

### STEP 8: Remove Local liquidationAddresses State

**File:** `src/pages/WalletOverviewPage.tsx`

**Action:** Remove duplicate state (already in context)

**Find (around line 45):**
```typescript
const [liquidationAddresses, setLiquidationAddresses] = useState<LiquidationAddress[]>([]);
```

**Delete this line** (we're using liquidationAddresses from context now)

**Verification:** Component should use `liquidationAddresses` from useData destructuring

---

### STEP 9: Rewrite loadAllWalletData for Progressive Loading

**File:** `src/pages/WalletOverviewPage.tsx`

**Action:** Replace loadAllWalletData to support progressive UI updates

**Find:** The `loadAllWalletData` function (around lines 308-338)

**Replace entire function with:**

```typescript
const loadAllWalletData = async () => {
  if (!wallet || !walletId || !customerId) return;
  
  try {
    // Filter function for transfers
    const filterTransfersByWallet = (transfers: Transfer[]) => {
      return filterWalletTransfers(transfers, walletId, wallet.address);
    };
    
    // Filter liquidation addresses for this wallet
    const walletLiquidationAddresses = liquidationAddresses.filter(
      (la) => la.destination_address.toLowerCase() === wallet.address.toLowerCase()
    );
    
    // Filter virtual accounts for this wallet
    const walletVirtualAccounts = virtualAccountsFromState.filter(
      (va) => va.destination.address.toLowerCase() === wallet.address.toLowerCase()
    );
    
    // Start all fetches without awaiting - allows progressive UI updates
    // Each fetch will complete independently and update its section of the UI
    
    // 1. Wallet Transactions - Fetch and update immediately when ready
    setIsWalletTxLoading(true);
    fetchWalletTransactions(walletId, limit).then(result => {
      setWalletTransactions(result.data);
      setWalletTransactionsRaw(result.raw);
      setIsWalletTxLoading(false);
    }).catch(error => {
      console.error('Error loading wallet transactions:', error);
      setIsWalletTxLoading(false);
    });
    
    // 2. Transfers - Progressive fetch, update when complete
    setIsTransfersLoading(true);
    fetchTransfersProgressive(customerId, limit, filterTransfersByWallet).then(result => {
      setTransfers(result.data);
      setTransfersRaw(result.raw);
      setIsTransfersLoading(false);
    }).catch(error => {
      console.error('Error loading transfers:', error);
      setIsTransfersLoading(false);
    });
    
    // 3. Liquidation History - Parallel fetch, update when all complete
    setIsLiquidationHistoryLoading(true);
    fetchLiquidationHistoryParallel(walletLiquidationAddresses, limit).then(result => {
      setLiquidationHistory(result.data);
      setLiquidationHistoryRaw(result.raw);
      setIsLiquidationHistoryLoading(false);
    }).catch(error => {
      console.error('Error loading liquidation history:', error);
      setIsLiquidationHistoryLoading(false);
    });
    
    // 4. Virtual Account Activity - Parallel fetch, update when all complete
    setIsVirtualAccountActivityLoading(true);
    fetchVirtualAccountActivityParallel(customerId, walletVirtualAccounts, limit).then(result => {
      setVirtualAccountActivity(result.data);
      setVirtualAccountActivityRaw(result.raw);
      setIsVirtualAccountActivityLoading(false);
    }).catch(error => {
      console.error('Error loading virtual account activity:', error);
      setIsVirtualAccountActivityLoading(false);
    });
    
  } catch (error) {
    console.error('Error in loadAllWalletData:', error);
  }
};
```

---

### STEP 10: Remove Debugger from loadAllWalletData useEffect

**File:** `src/pages/WalletOverviewPage.tsx`

**Action:** Remove debugger statement

**Find (around line 318):**
```typescript
const loadAllWalletData = async () => {
  if (!wallet || !walletId || !customerId) return;
  debugger;
```

**This is already removed in Step 9, but verify no debugger remains**

---

### STEP 11: Update initWallet Function

**File:** `src/pages/WalletOverviewPage.tsx`

**Action:** Remove direct bridgeAPI call, trust context data

**Find:** The `initWallet` function inside the useEffect (around lines 341-378)

**Replace with:**

```typescript
const initWallet = async () => {
  if (!walletId || !customerId) return;
  
  // Prevent duplicate loads
  if (hasLoadedRef.current) return;
  hasLoadedRef.current = true;
  
  try {
    setLoading(true);
    
    // Load customer data if not already loaded
    // This will populate wallets and liquidationAddresses in context
    if (!customer || customer.id !== customerId) {
      await loadCustomerData(customerId);
    }
    
    // Find wallet in context (should be populated by loadCustomerData)
    let walletToLoad = wallets.find(w => w.id === walletId);
    
    if (!walletToLoad) {
      setWalletNotFound(true);
      return;
    }
    
    // Set wallet - this will trigger the limit effect to load data
    setWallet(walletToLoad);
    
  } catch (error) {
    console.error('Error initializing wallet:', error);
    setWalletNotFound(true);
  } finally {
    setLoading(false);
  }
};
```

**Note:** Removed the duplicate `bridgeAPI.getCustomerWallets` call and the manual `loadAllWalletData` call.

---

### STEP 12: Fix Limit Change useEffect

**File:** `src/pages/WalletOverviewPage.tsx`

**Action:** Add previous value tracking to prevent false triggers

**Find:** The limit change useEffect (around lines 308-312)

**Replace with:**

```typescript
// Track previous limit to only reload when limit actually changes
const prevLimitRef = useRef(limit);

useEffect(() => {
  // Only reload if limit actually changed (not just component re-render)
  if (limit !== prevLimitRef.current && wallet && walletId && customerId && hasLoadedRef.current) {
    loadAllWalletData();
    prevLimitRef.current = limit;
  }
}, [limit, wallet, walletId, customerId]);
```

---

### STEP 13: Add Data Loading Effect After Wallet is Set

**File:** `src/pages/WalletOverviewPage.tsx`

**Action:** Add new useEffect to load data once wallet is ready

**Add this NEW useEffect AFTER the initWallet useEffect:**

```typescript
// Load wallet data once wallet is set and ready
useEffect(() => {
  if (wallet && walletId && customerId && hasLoadedRef.current) {
    loadAllWalletData();
  }
}, [wallet]);
```

---

### STEP 14: Update Table Reload Handlers

**File:** `src/pages/WalletOverviewPage.tsx`

**Action:** Simplify all table reload handlers to use context functions

**Find:** Wallet Transactions reload handler (around line 518)

**Replace:**
```typescript
onReload={async () => {
  if (!wallet || !walletId) return;
  debugger;
  
  setIsWalletTxCollapsed(false);
  await loadWalletTransactionsData(walletId, limit);
}}
```

**With:**
```typescript
onReload={async () => {
  if (!walletId) return;
  
  setIsWalletTxCollapsed(false);
  setIsWalletTxLoading(true);
  
  try {
    const result = await fetchWalletTransactions(walletId, limit);
    setWalletTransactions(result.data);
    setWalletTransactionsRaw(result.raw);
  } catch (error) {
    console.error('Error reloading wallet transactions:', error);
  } finally {
    setIsWalletTxLoading(false);
  }
}}
```

**Find:** Transfers reload handler

**Replace:**
```typescript
onReload={async () => {
  if (!wallet || !walletId || !customerId) return;
  
  setIsTransfersCollapsed(false);
  await loadTransfersData(customerId, limit, walletId, wallet.address);
}}
```

**With:**
```typescript
onReload={async () => {
  if (!wallet || !walletId || !customerId) return;
  
  setIsTransfersCollapsed(false);
  setIsTransfersLoading(true);
  
  try {
    const filterFn = (transfers: Transfer[]) => filterWalletTransfers(transfers, walletId, wallet.address);
    const result = await fetchTransfersProgressive(customerId, limit, filterFn);
    setTransfers(result.data);
    setTransfersRaw(result.raw);
  } catch (error) {
    console.error('Error reloading transfers:', error);
  } finally {
    setIsTransfersLoading(false);
  }
}}
```

**Find:** Liquidation History reload handler

**Replace:**
```typescript
onReload={async () => {
  if (!wallet || !walletId || !customerId) return;
  
  setIsLiquidationHistoryCollapsed(false);
  
  // Reload liquidation addresses first
  const addresses = await loadLiquidationAddressesData(customerId);
  
  // Then reload history
  await loadLiquidationHistoryData(addresses, wallet.address, limit);
}}
```

**With:**
```typescript
onReload={async () => {
  if (!wallet) return;
  
  setIsLiquidationHistoryCollapsed(false);
  setIsLiquidationHistoryLoading(true);
  
  try {
    const walletAddresses = liquidationAddresses.filter(
      (la) => la.destination_address.toLowerCase() === wallet.address.toLowerCase()
    );
    const result = await fetchLiquidationHistoryParallel(walletAddresses, limit);
    setLiquidationHistory(result.data);
    setLiquidationHistoryRaw(result.raw);
  } catch (error) {
    console.error('Error reloading liquidation history:', error);
  } finally {
    setIsLiquidationHistoryLoading(false);
  }
}}
```

**Find:** Virtual Account Activity reload handler

**Replace:**
```typescript
onReload={async () => {
  if (!wallet || !customerId || virtualAccountsFromState.length === 0) return;
  
  setIsVirtualAccountActivityCollapsed(false);
  await loadVirtualAccountActivityData(customerId, virtualAccountsFromState, wallet.address, limit);
}}
```

**With:**
```typescript
onReload={async () => {
  if (!wallet || !customerId) return;
  
  setIsVirtualAccountActivityCollapsed(false);
  setIsVirtualAccountActivityLoading(true);
  
  try {
    const walletAccounts = virtualAccountsFromState.filter(
      (va) => va.destination.address.toLowerCase() === wallet.address.toLowerCase()
    );
    const result = await fetchVirtualAccountActivityParallel(customerId, walletAccounts, limit);
    setVirtualAccountActivity(result.data);
    setVirtualAccountActivityRaw(result.raw);
  } catch (error) {
    console.error('Error reloading virtual account activity:', error);
  } finally {
    setIsVirtualAccountActivityLoading(false);
  }
}}
```

---

### STEP 15: Add Missing Import to DataContext

**File:** `src/context/DataContext.tsx`

**Action:** Import VirtualAccount and VirtualAccountActivity types

**Find:** The imports at the top (around line 4)

**Replace:**
```typescript
import type { Customer, Wallet, LiquidationAddress, WalletTransaction, Transfer, LiquidationHistory } from '../types';
```

**With:**
```typescript
import type { Customer, Wallet, LiquidationAddress, WalletTransaction, Transfer, LiquidationHistory, VirtualAccount, VirtualAccountActivity } from '../types';
```

---

## VERIFICATION CHECKLIST

After all steps are complete, verify:

### Code Quality:
- [ ] No `debugger` statements in any file
- [ ] No unused imports
- [ ] No TypeScript errors
- [ ] No undefined variables

### Architectural:
- [ ] WalletOverviewPage does NOT import bridgeAPI
- [ ] All HTTP calls go through DataContext functions
- [ ] No duplicate data fetching logic
- [ ] Individual fetch functions are pure (no state updates)
- [ ] Progressive loading works (UI updates as data arrives)

### Functionality:
- [ ] Page loads without errors
- [ ] Wallet transactions show progressively
- [ ] Transfers show progressively
- [ ] Liquidation history shows progressively
- [ ] Virtual account activity shows progressively
- [ ] Limit change reloads all data
- [ ] Refresh button works
- [ ] Table reload buttons work
- [ ] No duplicate API calls in network tab

### Network Calls (Monitor in DevTools):
**Initial Page Load (expected 5-10 calls):**
1. GET /customers/:id (from loadCustomerData)
2. GET /wallets?customer_id=X (from loadCustomerData)
3. GET /liquidation-addresses?customer_id=X (from loadCustomerData)
4. GET /customers (background, if customers empty)
5. GET /wallets/:id/transactions?limit=X (progressive)
6. GET /transfers?... (progressive, may be 1-5 calls)
7. GET /customers/:id/liquidation_addresses/:id/drains?... (parallel, one per address)
8. GET /customers/:id/virtual_accounts/:id/history?... (parallel, one per account)

**NO DUPLICATES**

**Limit Change (expected 4-6 calls):**
1. GET /wallets/:id/transactions?limit=NEW
2. GET /transfers?... (progressive with new limit)
3. GET /customers/:id/liquidation_addresses/:id/drains?limit=NEW (parallel)
4. GET /customers/:id/virtual_accounts/:id/history?limit=NEW (parallel)

**NO DUPLICATES, NO CONTEXT REFRESH**

---

## EXPECTED RESULTS

### Before Refactoring:
- **WalletOverviewPage.tsx:** 610 lines
- **DataContext.tsx:** 211 lines
- **Direct bridgeAPI calls from component:** 6
- **Duplicate fetching logic:** 5 instances
- **Debugger statements:** 11
- **Duplicate API calls on page load:** 3-5 duplicates
- **Progressive UI loading:** No (wait for all data)

### After Refactoring:
- **WalletOverviewPage.tsx:** ~450 lines (26% reduction)
- **DataContext.tsx:** ~450 lines (grows to accommodate proper architecture)
- **Direct bridgeAPI calls from component:** 0
- **Duplicate fetching logic:** 0
- **Debugger statements:** 0
- **Duplicate API calls on page load:** 0
- **Progressive UI loading:** Yes (show each section as ready)

### Benefits:
1. ✅ **Zero duplicate API calls** - Each endpoint called once per data need
2. ✅ **Single source of truth** - All fetching in DataContext
3. ✅ **Better UX** - Progressive loading shows data as it arrives
4. ✅ **Testable** - Individual fetch functions are pure and testable
5. ✅ **Maintainable** - Clear separation of concerns
6. ✅ **Reusable** - Fetch functions can be used by any component
7. ✅ **Production ready** - No debuggers, clean code

---

## EXECUTION ORDER

Execute steps in this exact order:

1. STEP 1 - Remove debuggers from bridgeAPI.ts
2. STEP 2 - Add individual fetch functions to DataContext
3. STEP 3 - Update DataContext interface
4. STEP 4 - Remove unused code from DataContext
5. STEP 5 - Update DataContext provider value
6. STEP 15 - Add missing imports to DataContext
7. STEP 6 - Remove bridgeAPI import from WalletOverviewPage
8. STEP 7 - Delete loader functions from WalletOverviewPage
9. STEP 8 - Remove local liquidationAddresses state
10. STEP 9 - Rewrite loadAllWalletData
11. STEP 11 - Update initWallet
12. STEP 12 - Fix limit change useEffect
13. STEP 13 - Add data loading effect
14. STEP 14 - Update table reload handlers

After each step, verify the code compiles. After all steps, run verification checklist.

---

**END OF IMPLEMENTATION PLAN**
