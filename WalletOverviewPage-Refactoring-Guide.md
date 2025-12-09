# WalletOverviewPage.tsx - Refactoring Implementation Guide

## Executive Summary

This guide provides step-by-step instructions to refactor WalletOverviewPage.tsx, addressing:
- **Duplicate API calls** when limit changes
- **Code duplication** across 3+ locations for same data fetching
- **4 conflicting useEffects** causing race conditions
- **600+ lines** in a single file
- **21+ state variables** making code hard to maintain

**Goal**: Reduce to ~400 lines, 1-2 useEffects, zero duplicate API calls, and maintainable architecture.

---

## Refactoring Principles

### Core Rules
1. **One function per data type** - Each data type (wallet transactions, transfers, etc.) has ONE dedicated loading function
2. **One unified loader** - Single entry point (`loadAllWalletData`) orchestrates all data loading
3. **Minimal useEffects** - Reduce to 1-2 effects maximum
4. **No reactive chains** - Don't update state just to trigger other useEffects
5. **Explicit over implicit** - Direct function calls over reactive dependencies

### Data Loading Strategy
```
User Action → Unified Loader → Individual Fetchers → State Updates
```

**NOT**:
```
User Action → State Update → useEffect → Another State Update → Another useEffect
```

---

## Implementation Steps

## Step 1: Create Individual Data Loading Functions

### Objective
Create 7 focused, single-responsibility functions for data loading. Each function:
- Takes explicit parameters (no implicit dependencies)
- Fetches from API
- Updates state (both data and raw)
- Returns the data for caller's use
- Handles errors gracefully

### 1.1 Load Wallet Transactions

**Location**: Add after `handleLimitBlur` function

```typescript
const loadWalletTransactionsData = async (walletId: string, limit: number) => {
  setIsWalletTxLoading(true);
  try {
    const response = await bridgeAPI.getWalletTransactions(walletId, limit)
      .catch(() => ({ count: 0, data: [] }));
    
    setWalletTransactions(response.data);
    setWalletTransactionsRaw(response);
    
    return response.data;
  } catch (error) {
    console.error('Error loading wallet transactions:', error);
    setWalletTransactions([]);
    setWalletTransactionsRaw({ count: 0, data: [] });
    return [];
  } finally {
    setIsWalletTxLoading(false);
  }
};
```

**Purpose**: Load wallet transactions for a specific wallet
**State Updates**: `walletTransactions`, `walletTransactionsRaw`, `isWalletTxLoading`
**Returns**: Array of wallet transactions

---

### 1.2 Load Transfers (Progressive Fetching)

**Location**: Add after `loadWalletTransactionsData`

```typescript
const loadTransfersData = async (
  customerId: string, 
  limit: number, 
  walletId?: string, 
  walletAddress?: string
) => {
  setIsTransfersLoading(true);
  try {
    // Progressive fetching until we have enough filtered results
    let allTransfers: Transfer[] = [];
    let allResponses: unknown[] = [];
    let updatedBeforeMs = Date.now();
    let fetchCount = 0;
    const maxFetches = 10;
    
    while (fetchCount < maxFetches) {
      fetchCount++;
      
      const transfersResponse = await bridgeAPI.getTransfers(customerId, limit, updatedBeforeMs);
      const fetchedTransfers = transfersResponse.data;
      allResponses.push(transfersResponse);
      
      allTransfers = [...allTransfers, ...fetchedTransfers];
      
      // Check if we have enough filtered results
      const filteredTransfers = filterWalletTransfers(allTransfers, walletId, walletAddress);
      
      // Exit conditions
      if (fetchedTransfers.length < limit || filteredTransfers.length >= limit) {
        break;
      }
      
      // Prepare for next fetch
      if (fetchedTransfers.length > 0) {
        const lastItem = fetchedTransfers[fetchedTransfers.length - 1];
        updatedBeforeMs = new Date(lastItem.updated_at).getTime();
      } else {
        break;
      }
    }
    
    setTransfers(allTransfers);
    setTransfersRaw({
      count: allTransfers.length,
      data: allTransfers,
      responses: allResponses
    });
    
    return allTransfers;
  } catch (error) {
    console.error('Error loading transfers:', error);
    setTransfers([]);
    setTransfersRaw({ count: 0, data: [], responses: [] });
    return [];
  } finally {
    setIsTransfersLoading(false);
  }
};
```

**Purpose**: Load transfers with progressive fetching until enough wallet-relevant items found
**State Updates**: `transfers`, `transfersRaw`, `isTransfersLoading`
**Returns**: Array of all transfers (caller can filter if needed)
**Key Logic**: Continues fetching until filtered results meet limit or API exhausted

---

### 1.3 Load Liquidation Addresses

**Location**: Add after `loadTransfersData`

```typescript
const loadLiquidationAddressesData = async (customerId: string) => {
  try {
    const response = await bridgeAPI.getLiquidationAddresses(customerId);
    setLiquidationAddresses(response.data);
    return response.data;
  } catch (error) {
    console.error('Error loading liquidation addresses:', error);
    setLiquidationAddresses([]);
    return [];
  }
};
```

**Purpose**: Load all liquidation addresses for a customer
**State Updates**: `liquidationAddresses`
**Returns**: Array of liquidation addresses
**Note**: No loading state (fast operation, loaded as part of main loader)

---

### 1.4 Load Liquidation History

**Location**: Add after `loadLiquidationAddressesData`

```typescript
const loadLiquidationHistoryData = async (
  customerId: string,
  liquidationAddresses: LiquidationAddress[],
  walletAddress: string,
  limit: number
) => {
  setIsLiquidationHistoryLoading(true);
  try {
    // Filter liquidation addresses for this wallet
    const filteredLiquidation = liquidationAddresses.filter(
      (la) => la.destination_address.toLowerCase() === walletAddress.toLowerCase()
    );

    if (filteredLiquidation.length === 0) {
      setLiquidationHistory([]);
      setLiquidationHistoryRaw({ count: 0, data: [], responses: [] });
      return [];
    }

    // Fetch history for all filtered addresses in parallel
    const historyPromises = filteredLiquidation.map((la) =>
      bridgeAPI.getLiquidationHistory(la.customer_id, la.id, limit)
        .catch(() => ({ count: 0, data: [] }))
    );
    
    const historyResponses = await Promise.all(historyPromises);
    
    // Combine and sort by date
    const allHistory = historyResponses
      .flatMap((response) => response.data)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setLiquidationHistory(allHistory);
    setLiquidationHistoryRaw({
      count: allHistory.length,
      data: allHistory,
      responses: historyResponses
    });
    
    return allHistory;
  } catch (error) {
    console.error('Error loading liquidation history:', error);
    setLiquidationHistory([]);
    setLiquidationHistoryRaw({ count: 0, data: [], responses: [] });
    return [];
  } finally {
    setIsLiquidationHistoryLoading(false);
  }
};
```

**Purpose**: Load liquidation history for addresses matching this wallet
**State Updates**: `liquidationHistory`, `liquidationHistoryRaw`, `isLiquidationHistoryLoading`
**Returns**: Array of liquidation history items
**Key Logic**: Filters addresses by wallet, fetches history in parallel, combines and sorts

---

### 1.5 Load Virtual Account Activity

**Location**: Add after `loadLiquidationHistoryData`

```typescript
const loadVirtualAccountActivityData = async (
  customerId: string,
  virtualAccounts: VirtualAccount[],
  walletAddress: string,
  limit: number
) => {
  setIsVirtualAccountActivityLoading(true);
  try {
    // Filter virtual accounts where destination address matches wallet
    const filteredVirtualAccounts = virtualAccounts.filter(
      (va) => va.destination.address.toLowerCase() === walletAddress.toLowerCase()
    );

    if (filteredVirtualAccounts.length === 0) {
      setVirtualAccountActivity([]);
      setVirtualAccountActivityRaw({ count: 0, data: [], responses: [] });
      return [];
    }

    // Fetch activity for all filtered accounts in parallel
    const activityPromises = filteredVirtualAccounts.map((va) =>
      bridgeAPI.getVirtualAccountActivity(customerId, va.id, limit)
        .catch(() => ({ count: 0, data: [] }))
    );
    
    const activityResponses = await Promise.all(activityPromises);
    
    // Combine and sort by created_at
    const allActivity = activityResponses
      .flatMap((response) => response.data)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setVirtualAccountActivity(allActivity);
    setVirtualAccountActivityRaw({
      count: allActivity.length,
      data: allActivity,
      responses: activityResponses
    });
    
    return allActivity;
  } catch (error) {
    console.error('Error loading virtual account activity:', error);
    setVirtualAccountActivity([]);
    setVirtualAccountActivityRaw({ count: 0, data: [], responses: [] });
    return [];
  } finally {
    setIsVirtualAccountActivityLoading(false);
  }
};
```

**Purpose**: Load virtual account activity for accounts routing to this wallet
**State Updates**: `virtualAccountActivity`, `virtualAccountActivityRaw`, `isVirtualAccountActivityLoading`
**Returns**: Array of virtual account activity items
**Key Logic**: Filters accounts by destination address, fetches activity in parallel, combines and sorts

---

## Step 2: Create Unified Data Loader

### Objective
Replace `loadAllWalletData` and `loadData` with a single, comprehensive loader that orchestrates all data fetching.

### 2.1 Replace loadAllWalletData Function

**Find**: The current `loadAllWalletData` function (lines ~118-218)

**Replace with**:

```typescript
const loadAllWalletData = async () => {
  if (!wallet || !walletId || !customerId) return;
  
  try {
    // Load wallet transactions
    await loadWalletTransactionsData(walletId, limit);
    
    // Load transfers with progressive fetching
    await loadTransfersData(customerId, limit, walletId, wallet.address);
    
    // Load liquidation addresses first
    const liquidationAddressesData = await loadLiquidationAddressesData(customerId);
    
    // Then load liquidation history for this wallet
    await loadLiquidationHistoryData(customerId, liquidationAddressesData, wallet.address, limit);
    
    // Load virtual account activity
    await loadVirtualAccountActivityData(customerId, virtualAccountsFromState, wallet.address, limit);
    
  } catch (error) {
    console.error('Error loading wallet data:', error);
  }
};
```

**Purpose**: Orchestrate all data loading in correct sequence
**Key Changes**:
- Removed individual loading state management (handled by individual functions)
- Removed all duplicate code
- Removed debugger statement
- Sequential calls where dependencies exist
- Passes liquidationAddresses result to history loader (no state dependency)

---

### 2.2 Remove Old loadData Function

**Find**: The `loadData` function (lines ~382-398)

**Action**: **DELETE ENTIRELY**

**Reason**: This is the old loader that doesn't handle virtual accounts and conflicts with the new architecture.

---

## Step 3: Consolidate useEffects

### Objective
Reduce from 4 useEffects to 2 clean, non-conflicting effects.

### 3.1 Remove Duplicate useEffects

**Delete These useEffects**:

1. **useEffect #1** (Reload on limit change) - Lines ~113-117
2. **useEffect #3** (Load liquidation history) - Lines ~298-337
3. **useEffect #4** (Load virtual account activity) - Lines ~340-380

**Reason**: These create duplicate API calls and are replaced by unified loader.

---

### 3.2 Simplify Initial Load useEffect

**Find**: The initial wallet load useEffect (lines ~220-296)

**Replace with**:

```typescript
useEffect(() => {
  const initWallet = async () => {
    if (!walletId || !customerId) return;
    
    // Prevent duplicate loads
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    
    try {
      setLoading(true);
      
      // Load customer data if not already loaded
      if (!customer || customer.id !== customerId) {
        await loadCustomerData(customerId);
      }
      
      // Find or fetch wallet
      let walletToLoad = wallets.find(w => w.id === walletId);
      
      if (!walletToLoad) {
        const walletsData = await bridgeAPI.getCustomerWallets(customerId);
        walletToLoad = walletsData.data.find(w => w.id === walletId);
        
        if (!walletToLoad) {
          setWalletNotFound(true);
          return;
        }
      }
      
      // Set wallet and load all data
      setWallet(walletToLoad);
      
      // Wait for wallet state to update before loading data
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Load all wallet data
      await loadAllWalletData();
      
    } catch (error) {
      console.error('Error initializing wallet:', error);
      setWalletNotFound(true);
    } finally {
      setLoading(false);
    }
  };
  
  initWallet();
  
  // Cleanup on unmount
  return () => {
    hasLoadedRef.current = false;
  };
}, [walletId, customerId]);
```

**Key Changes**:
- Calls `loadAllWalletData()` instead of old `loadData()`
- Handles wallet loading inline (no separate path)
- Waits for wallet state update before loading data
- Single data loading path

---

### 3.3 Add Limit Change useEffect

**Add New useEffect** (after the initial load effect):

```typescript
// Reload all data when limit changes
useEffect(() => {
  if (wallet && walletId && customerId && hasLoadedRef.current) {
    loadAllWalletData();
  }
}, [limit]);
```

**Purpose**: Reload all data when limit changes
**Condition**: Only runs after initial load is complete (`hasLoadedRef.current`)
**No Conflicts**: Individual loaders manage their own loading states

---

### 3.4 Remove Duplicate Prevention Ref

**Find**: `const isLoadingLiquidationHistoryRef = useRef(false);`

**Action**: **DELETE**

**Reason**: No longer needed since we eliminated the duplicate useEffect

---

## Step 4: Update handleRefresh Function

### Objective
Simplify refresh to use unified loader.

**Find**: The `handleRefresh` function (lines ~400-405)

**Replace with**:

```typescript
const handleRefresh = async () => {
  if (!wallet || !walletId || !customerId) return;
  
  await refreshAll();
  await loadAllWalletData();
};
```

**Key Changes**:
- Removed conditional check (already at function start)
- Calls unified loader
- Cleaner logic

---

## Step 5: Update Table onReload Functions

### Objective
Simplify each table's reload logic to call the specific loader function.

### 5.1 Wallet Transactions Table

**Find**: The `onReload` prop in Wallet Transactions DynamicTransactionsTable (lines ~456-480)

**Replace with**:

```typescript
onReload={async () => {
  if (!wallet || !walletId) return;
  
  setIsWalletTxCollapsed(false);
  await loadWalletTransactionsData(walletId, limit);
}}
```

**Key Changes**:
- Removed data clearing (loader handles it)
- Removed setTimeout (not needed)
- Removed try/catch/rollback (loader handles errors)
- Removed console.logs
- Much cleaner: 5 lines instead of 28

---

### 5.2 Transfers Table

**Find**: The `onReload` prop in Transfers DynamicTransactionsTable (lines ~495-579)

**Replace with**:

```typescript
onReload={async () => {
  if (!wallet || !walletId || !customerId) return;
  
  setIsTransfersCollapsed(false);
  await loadTransfersData(customerId, limit, walletId, wallet.address);
}}
```

**Key Changes**:
- Removed debugger statement
- Removed all progressive fetching logic (in loader)
- Removed data clearing, setTimeout, rollback
- Removed all console.logs
- 5 lines instead of 85 lines

---

### 5.3 Liquidation History Table

**Find**: The `onReload` prop in Liquidation History DynamicTransactionsTable (lines ~594-617)

**Replace with**:

```typescript
onReload={async () => {
  if (!wallet || !walletId || !customerId) return;
  
  setIsLiquidationHistoryCollapsed(false);
  
  // Reload liquidation addresses first
  const addresses = await loadLiquidationAddressesData(customerId);
  
  // Then reload history
  await loadLiquidationHistoryData(customerId, addresses, wallet.address, limit);
}}
```

**Key Changes**:
- No longer relies on useEffect side effects
- Direct, explicit data loading
- Removed setTimeout, data clearing
- 10 lines instead of 24 lines

---

### 5.4 Virtual Account Activity Table

**Find**: The `onReload` prop in Virtual Account Activity DynamicTransactionsTable (lines ~632-667)

**Replace with**:

```typescript
onReload={async () => {
  if (!wallet || !customerId || virtualAccountsFromState.length === 0) return;
  
  setIsVirtualAccountActivityCollapsed(false);
  await loadVirtualAccountActivityData(customerId, virtualAccountsFromState, wallet.address, limit);
}}
```

**Key Changes**:
- Removed data clearing, setTimeout
- Removed filtering logic (in loader)
- Removed try/catch/rollback
- Removed console.logs
- 5 lines instead of 36 lines

---

## Step 6: Clean Up Production Code

### 6.1 Remove Debugging Artifacts

**Actions**:
1. Remove debugger statement from old transfers reload (if not already removed)
2. Review all console.log statements - keep only critical errors
3. Remove console.log success messages (✅ emojis)

**Keep**:
- `console.error()` for actual errors
- User-facing error states

**Remove**:
- `console.log('✅ ...')`
- `console.log('🔄 ...')`
- All debugger statements

---

### 6.2 Update handleLimitBlur

**Current function has issue**: Doesn't call `setLimit()` with validated value.

**Find**: `handleLimitBlur` function

**Replace with**:

```typescript
const handleLimitBlur = () => {
  const numValue = parseInt(limitInput, 10);
  
  let validatedLimit = 10; // default
  
  if (!isNaN(numValue)) {
    if (numValue < 10) {
      validatedLimit = 10;
    } else if (numValue > 100) {
      validatedLimit = 100;
    } else {
      validatedLimit = numValue;
    }
  }
  
  setLimitInput(validatedLimit.toString());
  setLimit(validatedLimit);
};
```

**Fix**: Ensures `setLimit()` is always called with validated value

---

### 6.3 Improve Input onChange Handler

**Find**: The limit input's `onChange` handler (line ~467)

**Replace**:

```typescript
onChange={(e) => setLimitInput(e.target.value)}
```

**Reason**: `e.stopPropagation()` is unnecessary here

---

## Step 7: Final Verification Checklist

### Data Loading Functions Created ✓
- [ ] `loadWalletTransactionsData(walletId, limit)`
- [ ] `loadTransfersData(customerId, limit, walletId?, walletAddress?)`
- [ ] `loadLiquidationAddressesData(customerId)`
- [ ] `loadLiquidationHistoryData(customerId, addresses, walletAddress, limit)`
- [ ] `loadVirtualAccountActivityData(customerId, virtualAccounts, walletAddress, limit)`

### Unified Loader ✓
- [ ] `loadAllWalletData()` calls all 5 loaders in sequence
- [ ] Passes data between loaders (no state dependencies)

### useEffects Reduced ✓
- [ ] Only 2 useEffects remain (initial load + limit change)
- [ ] No duplicate API calls on limit change
- [ ] No cascading reactive chains

### Functions Removed ✓
- [ ] Old `loadData()` function deleted
- [ ] Old `loadAllWalletData()` replaced
- [ ] 3 useEffects deleted

### Refs Cleaned ✓
- [ ] `hasLoadedRef` - kept (prevents duplicate initial loads)
- [ ] `isLoadingLiquidationHistoryRef` - deleted

### Table Reload Functions ✓
- [ ] Wallet Transactions: calls `loadWalletTransactionsData()`
- [ ] Transfers: calls `loadTransfersData()`
- [ ] Liquidation History: calls both address and history loaders
- [ ] Virtual Account Activity: calls `loadVirtualAccountActivityData()`

### Code Quality ✓
- [ ] All debugger statements removed
- [ ] Excessive console.logs removed
- [ ] handleLimitBlur properly validates and sets limit
- [ ] Input onChange simplified

### Functional Tests ✓
- [ ] Initial page load works
- [ ] Limit change triggers single reload
- [ ] Each table reload button works independently
- [ ] Refresh button works
- [ ] No duplicate API calls in network tab
- [ ] All data displays correctly

---

## Expected Results

### Before Refactor
- **Lines**: ~618 lines
- **useEffects**: 4 (with conflicts)
- **State Variables**: 21+
- **Duplicate Code**: 3+ instances of same fetching logic
- **API Calls on Limit Change**: 5 (wallet tx, transfers, liq addresses, liq history x2, virtual activity x2)

### After Refactor
- **Lines**: ~400 lines
- **useEffects**: 2 (clean, no conflicts)
- **State Variables**: 21 (same, but better organized)
- **Duplicate Code**: 0 (all extracted to functions)
- **API Calls on Limit Change**: 5 (wallet tx, transfers, liq addresses, liq history, virtual activity) - NO DUPLICATES

### Key Improvements
1. **Zero Duplicate API Calls**: Each data type loads exactly once per trigger
2. **Single Data Path**: All loading goes through unified loader
3. **Maintainable**: Each function has single responsibility
4. **Testable**: Functions can be unit tested
5. **Debuggable**: Clear flow, no reactive mysteries
6. **Extensible**: Easy to add new data types

---

## Migration Path

### Phase 1: Create Functions (Low Risk)
1. Add all 5 individual data loading functions
2. Test each function independently
3. No changes to existing code yet

### Phase 2: Update Unified Loader (Medium Risk)
1. Replace `loadAllWalletData()` to call new functions
2. Test full data loading
3. Verify no regressions

### Phase 3: Consolidate useEffects (High Risk)
1. Delete 3 duplicate useEffects
2. Update initial load useEffect
3. Test thoroughly - most likely to have issues

### Phase 4: Update UI Handlers (Low Risk)
1. Update table reload functions
2. Update handleRefresh
3. Test user interactions

### Phase 5: Clean Up (Low Risk)
1. Remove old `loadData()`
2. Remove debug code
3. Final testing

---

## Troubleshooting

### Issue: Data not loading on initial load
**Cause**: `wallet` state not set before `loadAllWalletData()` called
**Fix**: Ensure `setTimeout(0)` waits for wallet state update

### Issue: Limit change doesn't reload all data
**Cause**: `hasLoadedRef.current` is false
**Fix**: Check ref is set to true after initial load

### Issue: Table reload doesn't work
**Cause**: Missing function parameters
**Fix**: Verify all required params (customerId, walletId, wallet.address) are passed

### Issue: Duplicate API calls still happening
**Cause**: Old useEffects not deleted
**Fix**: Verify only 2 useEffects remain in component

### Issue: Liquidation history not loading
**Cause**: Addresses not passed to history loader
**Fix**: In reload handler, fetch addresses first, then pass to history loader

---

## Summary

This refactoring transforms a complex, bug-prone component into a clean, maintainable architecture:

1. **7 focused data functions** - One per data type
2. **1 unified loader** - Single orchestration point
3. **2 clean useEffects** - No conflicts or duplicates
4. **Simple reload handlers** - Direct function calls
5. **Zero duplicate API calls** - Each fetch happens exactly once

The key insight: **Stop using useEffect as a data loader**. Use it only for initialization and user-triggered changes. All actual data fetching goes through explicit function calls.
