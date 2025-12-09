# WalletOverviewPage.tsx - Deep Analysis

## Overview
This component displays a comprehensive overview of a wallet, including transactions, transfers, liquidation history, and virtual account activity. It manages complex data loading with multiple API calls and user interactions.

---

## State Variables

### Core Data States
- `wallet`: Current wallet object or null
- `walletNotFound`: Boolean flag for 404 state
- `liquidationAddresses`: Array of liquidation addresses
- `walletTransactions`: Array of wallet transactions
- `transfers`: Array of transfers
- `liquidationHistory`: Array of liquidation history items
- `virtualAccountActivity`: Array of virtual account activity items

### Raw API Response States (for JSON viewer)
- `walletTransactionsRaw`: Raw API response for wallet transactions
- `transfersRaw`: Raw API response for transfers
- `liquidationHistoryRaw`: Raw API response for liquidation history
- `virtualAccountActivityRaw`: Raw API response for virtual account activity

### UI States
- `limit`: Number - maximum items to fetch (10-100)
- `limitInput`: String - controlled input value for limit
- `loading`: Global loading state
- `copiedField`: Track which field was copied to clipboard

### Collapse States
- `isTransactionsCollapsed`: Main transactions section
- `isWalletTxCollapsed`: Wallet transactions table
- `isTransfersCollapsed`: Transfers table
- `isLiquidationHistoryCollapsed`: Liquidation history table
- `isVirtualAccountActivityCollapsed`: Virtual account activity table

### Individual Loading States
- `isWalletTxLoading`: Wallet transactions loading
- `isTransfersLoading`: Transfers loading
- `isLiquidationHistoryLoading`: Liquidation history loading
- `isVirtualAccountActivityLoading`: Virtual account activity loading

### JSON Viewer Modal States
- `jsonModalOpen`: Modal visibility
- `jsonModalTitle`: Modal title
- `jsonModalData`: Data to display in modal

### Refs
- `hasLoadedRef`: Prevents duplicate initial loads
- `isLoadingLiquidationHistoryRef`: Prevents duplicate liquidation history loads

### From Context/Router
- `customerId`, `walletId`: URL parameters
- `wallets`: From DataContext
- `virtualAccountsFromState`: From navigation state (location.state)
- `customer`: From DataContext

---

## Helper Functions

### `filterWalletTransfers(transfers, walletId, walletAddress)`
**Purpose**: Filter transfers related to a specific wallet

**Logic**:
1. Converts wallet address to lowercase for comparison
2. Checks if transfer matches by:
   - `source.bridge_wallet_id` === walletId, OR
   - `source.from_address` === wallet address (case-insensitive)
3. Returns filtered array

**Used By**: Multiple places to filter transfers for current wallet

---

### `copyToClipboard(text, fieldId)`
**Purpose**: Copy text to clipboard and show temporary success indicator

**Logic**:
1. Uses navigator.clipboard.writeText
2. Sets `copiedField` to fieldId
3. Clears `copiedField` after 2 seconds
4. Handles errors silently

---

### `openJsonModal(title, data)`
**Purpose**: Open JSON viewer modal with specific data

**Logic**:
1. Sets modal title
2. Sets modal data
3. Opens modal

---

### `handleLimitBlur()`
**Purpose**: Validate and enforce limit input constraints

**Logic**:
1. Parse limitInput as integer
2. If NaN or < 10: set to 10
3. If > 100: set to 100
4. Updates both limitInput (string) and limit (number)

---

## Main Functions

### `loadAllWalletData()`
**Purpose**: Comprehensive data loading function that fetches all wallet-related data

**Dependencies**: wallet, walletId, customerId (checked at start)

**Logic Flow**:

1. **Set all loading states to true**
   - Sets 4 individual loading flags

2. **Load Wallet Transactions**
   - Calls `bridgeAPI.getWalletTransactions(walletId, limit)`
   - On error: returns { count: 0, data: [] }
   - Updates `walletTransactions` and `walletTransactionsRaw`

3. **Load Transfers (Progressive Fetching)**
   - **Complex Algorithm**: Fetches transfers progressively until conditions met
   - Initializes:
     - `allTransfers`: accumulator array
     - `allResponses`: stores all API responses
     - `updatedBeforeMs`: timestamp for pagination
     - `fetchCount`: iteration counter
     - `maxFetches`: safety limit (10)
   
   - **Loop** (while fetchCount < maxFetches):
     - Fetch transfers with `bridgeAPI.getTransfers(customerId, limit, updatedBeforeMs)`
     - Append to `allTransfers` and `allResponses`
     - Filter transfers for this wallet using `filterWalletTransfers`
     
     - **Exit Conditions**:
       1. Fetched items < limit (API has no more data)
       2. Filtered transfers >= limit (enough relevant data)
     
     - **Pagination**: Update `updatedBeforeMs` from last item's `updated_at`
   
   - Updates `transfers` and `transfersRaw` with combined results

4. **Load Liquidation Addresses & History**
   - Fetch all liquidation addresses: `bridgeAPI.getLiquidationAddresses(customerId)`
   - Filter addresses where `destination_address` matches wallet address (case-insensitive)
   
   - If filtered addresses exist:
     - Create promises array for each address: `bridgeAPI.getLiquidationHistory()`
     - Execute all promises in parallel with `Promise.all()`
     - Flatten results from all addresses
     - Sort by `created_at` descending
     - Update `liquidationHistory` and `liquidationHistoryRaw`

5. **Load Virtual Account Activity**
   - Filter virtual accounts where `destination.address` matches wallet address (case-insensitive)
   
   - If filtered accounts exist:
     - Create promises array for each account: `bridgeAPI.getVirtualAccountActivity()`
     - Execute all promises in parallel
     - Flatten and sort by `created_at` descending
     - Update `virtualAccountActivity` and `virtualAccountActivityRaw`

6. **Error Handling**
   - Catches and logs errors
   - Finally block: sets all 4 loading states to false

---

### `loadData(walletToLoad?)`
**Purpose**: Legacy data loading function (appears to be older approach)

**Parameters**: Optional wallet to load (defaults to current wallet state)

**Dependencies**: walletId, wallet

**Logic**:
1. Use provided wallet or current wallet state
2. Set global loading to true
3. Call `loadWalletData()` from DataContext
4. Update state with returned data:
   - liquidationAddresses
   - walletTransactions + raw
   - transfers + raw
   - liquidationHistory + raw
5. Catch and log errors
6. Set loading to false

**Note**: This function does NOT load virtual account activity (older implementation)

---

### `handleRefresh()`
**Purpose**: Refresh all data from DataContext and reload wallet data

**Logic**:
1. Call `refreshAll()` from DataContext
2. If walletId and wallet exist, call `loadData()`

---

## useEffect Hooks Analysis

### useEffect #1: Reload on Limit Change
**Dependencies**: `[limit]`

**Trigger**: When `limit` changes

**Logic**:
1. Check if wallet, walletId, customerId exist
2. Check if initial load completed (`hasLoadedRef.current`)
3. If all true: call `loadAllWalletData()`

**Purpose**: Refresh all data when user changes the max items limit

**Issues**:
- Could cause unnecessary reloads if limit changes before initial load

---

### useEffect #2: Initial Wallet Load
**Dependencies**: `[walletId, customerId]`

**Trigger**: When walletId or customerId changes

**Logic**:

1. **Guard Clauses**:
   - Return if no walletId or customerId
   - Return if already loaded (`hasLoadedRef.current`)
   - Set `hasLoadedRef.current = true` to prevent re-entry

2. **Load Customer Data**:
   - Check if customer not loaded or different customerId
   - If needed: call `loadCustomerData(customerId)`
   - On error: set walletNotFound, return

3. **Find Wallet in Context**:
   - Search for wallet in `wallets` array by id
   - If found: set wallet, call `loadData(walletFromContext)`

4. **Fetch Wallet from API** (if not in context):
   - Set loading true
   - Call `bridgeAPI.getCustomerWallets(customerId)`
   - Find wallet by id in response
   - If found: set wallet, call `loadData(foundWallet)`
   - If not found: set walletNotFound
   - Handle errors, set loading false

5. **Cleanup Function**:
   - Resets `hasLoadedRef.current = false` on unmount

**Issues**:
- Uses old `loadData()` function instead of `loadAllWalletData()`
- Complex flow with multiple data sources (context vs API)

---

### useEffect #3: Load Liquidation History
**Dependencies**: `[liquidationAddresses, wallet, customerId, limit]`

**Trigger**: When liquidationAddresses, wallet, customerId, or limit changes

**Logic**:

1. **Duplicate Prevention**:
   - Return if `isLoadingLiquidationHistoryRef.current` is true

2. **Guard Clauses**:
   - If no wallet, customerId, or empty liquidationAddresses:
     - Clear liquidationHistory and raw data
     - Return

3. **Filter Addresses**:
   - Filter liquidationAddresses by destination_address matching wallet address

4. **If No Matches**:
   - Clear liquidationHistory and raw data
   - Return

5. **Fetch History**:
   - Set ref flag: `isLoadingLiquidationHistoryRef.current = true`
   - Create promises for each filtered address
   - Execute with `Promise.all()`
   - Flatten results
   - Sort by created_at descending
   - Update state

6. **Finally**:
   - Reset ref flag to false

**Purpose**: Auto-load liquidation history when liquidation addresses change

**Issues**:
- Duplicate logic with `loadAllWalletData()`
- Triggers on `limit` change, but `loadAllWalletData()` also runs on limit change

---

### useEffect #4: Load Virtual Account Activity
**Dependencies**: `[wallet, customerId, virtualAccountsFromState, limit]`

**Trigger**: When wallet, customerId, virtualAccountsFromState, or limit changes

**Logic**:

1. **Guard Clauses**:
   - If no wallet, customerId, or empty virtualAccountsFromState:
     - Clear virtualAccountActivity and raw data
     - Return

2. **Filter Virtual Accounts**:
   - Filter by destination.address matching wallet address (case-insensitive)

3. **If No Matches**:
   - Clear virtualAccountActivity and raw data
   - Return

4. **Fetch Activity**:
   - Set `isVirtualAccountActivityLoading = true`
   - Create promises for each filtered account
   - Execute with `Promise.all()`
   - Flatten results
   - Sort by created_at descending
   - Update state
   - Log success

5. **Error Handling**:
   - Catch and log errors

6. **Finally**:
   - Set loading false

**Purpose**: Auto-load virtual account activity when accounts or wallet changes

**Issues**:
- Duplicate logic with `loadAllWalletData()`
- Triggers on `limit` change, causing duplicate loads

---

## JSX Logic Analysis

### Header Section

**Limit Input Handler**:
- `onChange`: Calls `e.stopPropagation()` (prevents parent handlers)
- `onBlur`: Calls `handleLimitBlur()` to validate/enforce constraints
- Min: 10, Max: 100
- Controlled input with `limitInput` state

**Refresh Button**:
- `onClick`: Calls `handleRefresh()`

---

### DynamicTransactionsTable Components

Each table has complex `onReload` logic. Here's the breakdown:

#### 1. Wallet Transactions Table

**onReload Logic**:
1. Guard: Return if no wallet or walletId
2. Store previous data for rollback
3. **Expand table**: `setIsWalletTxCollapsed(false)`
4. **Clear items**: `setWalletTransactions([])`
5. `setTimeout(() => {}, 0)`: Flush state updates
6. Set loading: `setIsWalletTxLoading(true)`
7. **Try**:
   - Fetch: `bridgeAPI.getWalletTransactions(walletId, limit)`
   - On error: returns { count: 0, data: [] }
   - Update state with new data
   - Log success
8. **Catch**:
   - Log error
   - Rollback to previous data
9. **Finally**:
   - Set loading false
   - Keep table expanded

**Key Features**:
- Bypasses cache (direct API call)
- Optimistic UI (clears before loading)
- Rollback on error
- Auto-expands table

---

#### 2. Transfers Table

**onReload Logic** (Most Complex):
1. Guard: Return if no wallet, walletId, or customerId
2. Store previous data for rollback
3. **Expand table**: `setIsTransfersCollapsed(false)`
4. **Clear items**: `setTransfers([])`
5. `setTimeout(() => {}, 0)`: Flush state updates
6. Set loading: `setIsTransfersLoading(true)`
7. **Debugger statement**: `debugger` (should be removed in production)
8. **Try - Progressive Fetching Algorithm**:
   - Initialize:
     - `allTransfers = []`
     - `allResponses = []`
     - `updatedBeforeMs = Date.now()`
     - `fetchCount = 0`
     - `maxFetches = 10`
   
   - **While Loop** (fetchCount < maxFetches):
     - Increment fetchCount
     - Fetch: `bridgeAPI.getTransfers(customerId, limit, updatedBeforeMs)`
     - Append to arrays
     - **Update UI immediately** with accumulated results
     - Filter for this wallet
     - Log progress
     
     - **Exit Conditions**:
       1. `fetchedTransfers.length < limit` (API exhausted)
       2. `filteredTransfers.length >= limit` (enough data)
     
     - **Pagination**: Extract last item's `updated_at` timestamp
   
   - Log final count
9. **Catch**:
   - Log error
   - Rollback to previous data
10. **Finally**:
    - Set loading false
    - Keep table expanded

**Key Features**:
- Progressive loading with real-time UI updates
- Pagination using `updated_before_ms`
- Smart exit conditions
- Has debugger statement (development artifact)

---

#### 3. Liquidation History Table

**onReload Logic**:
1. Guard: Return if no wallet, walletId, or customerId
2. Store previous liquidation addresses
3. **Expand table**: `setIsLiquidationHistoryCollapsed(false)`
4. **Clear items**: `setLiquidationHistory([])`
5. `setTimeout(() => {}, 0)`: Flush state updates
6. Set loading: `setIsLiquidationHistoryLoading(true)`
7. **Try**:
   - Fetch: `bridgeAPI.getLiquidationAddresses(customerId, limit)`
   - Update: `setLiquidationAddresses(liquidationData.data)`
   - Log: "history will auto-load"
   - **Note**: Relies on useEffect #3 to load actual history
8. **Catch**:
   - Log error
   - Rollback addresses
9. **Finally**:
   - Set loading false
   - Keep table expanded

**Key Features**:
- Indirect reload (refreshes addresses, triggering useEffect)
- Relies on side effects for actual data loading

---

#### 4. Virtual Account Activity Table

**onReload Logic**:
1. Guard: Return if no wallet, customerId, or empty virtualAccountsFromState
2. Store previous activity data
3. **Expand table**: `setIsVirtualAccountActivityCollapsed(false)`
4. **Clear items**: `setVirtualAccountActivity([])`
5. `setTimeout(() => {}, 0)`: Flush state updates
6. Set loading: `setIsVirtualAccountActivityLoading(true)`
7. **Try**:
   - Filter virtual accounts by destination address
   - If matches exist:
     - Create promises for each account
     - `Promise.all()` to fetch activity
     - Flatten results
     - Sort by created_at descending
     - Update state
     - Log success
8. **Catch**:
   - Log error
   - Rollback to previous data
9. **Finally**:
   - Set loading false
   - Keep table expanded

**Key Features**:
- Direct data fetching (no side effects)
- Parallel API calls with Promise.all()

---

## Critical Issues Identified

### 1. Code Duplication
- Progressive fetching logic duplicated in:
  - `loadAllWalletData()`
  - Transfers table `onReload`
- Liquidation history fetching duplicated in:
  - `loadAllWalletData()`
  - useEffect #3
  - Liquidation History table `onReload` (indirect)
- Virtual account activity fetching duplicated in:
  - `loadAllWalletData()`
  - useEffect #4
  - Virtual Account Activity table `onReload`

### 2. Multiple useEffects Causing Duplicate Calls

**Scenario**: User changes limit from 10 to 20

**What Happens**:
1. useEffect #1 triggers → calls `loadAllWalletData()`
   - Loads wallet transactions
   - Loads transfers
   - Loads liquidation addresses
   - Loads liquidation history
   - Loads virtual account activity

2. useEffect #3 triggers (limit is in dependencies) → loads liquidation history AGAIN

3. useEffect #4 triggers (limit is in dependencies) → loads virtual account activity AGAIN

**Result**: Liquidation history and virtual account activity loaded **twice**

### 3. Inconsistent Data Loading

- Initial load uses `loadData()` (old function)
- Limit change uses `loadAllWalletData()` (new function)
- `loadData()` doesn't load virtual account activity
- Different data sources at different times

### 4. Race Conditions

- useEffect #3 and #4 can race with `loadAllWalletData()`
- No coordination between effects
- `isLoadingLiquidationHistoryRef` only prevents duplicate useEffect calls, not conflicts with `loadAllWalletData()`

### 5. Complex Dependency Chains

**Liquidation History Flow**:
1. User clicks reload
2. Updates `liquidationAddresses`
3. Triggers useEffect #3
4. useEffect loads history

**Problem**: Indirect coupling, hard to trace

### 6. Debugging Artifacts
- `debugger` statements in production code (line 140, line 534)
- Multiple console.log statements

### 7. State Management Complexity
- 21+ state variables
- 2 refs for duplicate prevention
- Difficult to track state changes

### 8. Missing Error Recovery
- Some API calls use `.catch(() => ({ count: 0, data: [] }))`
- Silently fails, user may not know data failed to load

---

## Refactoring Recommendations

### 1. **Consolidate Data Fetching**
- Create single source of truth function
- Remove duplicate fetching logic
- Use one comprehensive loader

### 2. **Simplify useEffects**
- Reduce to 1-2 effects maximum
- Remove reactive dependencies that cause cascading loads
- Move complex logic to functions

### 3. **Extract Reusable Hooks**
- `useProgressiveFetch` for transfers logic
- `useParallelFetch` for liquidation/virtual account logic
- `useClipboard` for copy functionality

### 4. **Consolidate State**
- Group related states into objects
- Use useReducer for complex state management
- Consider state machine pattern

### 5. **Remove Indirect Dependencies**
- Don't update state just to trigger other useEffects
- Make data flows explicit
- Direct function calls over reactive chains

### 6. **Improve Error Handling**
- Show user-friendly error messages
- Provide retry mechanisms
- Don't silently fail

### 7. **Split Component**
- Extract table sections to separate components
- Move each table's reload logic to its component
- Reduce main component size

### 8. **Clean Up Production Code**
- Remove debugger statements
- Reduce console.log usage
- Add proper error logging service

---

## Proposed Architecture

### New Structure:
```
WalletOverviewPage (Container)
├── useWalletData() - Custom hook for all data fetching
├── WalletHeader - Header component
├── TransactionsSection - Container for all tables
│   ├── WalletTransactionsTable
│   ├── TransfersTable (with useProgressiveFetch)
│   ├── LiquidationHistoryTable (with useParallelFetch)
│   └── VirtualAccountActivityTable (with useParallelFetch)
└── LiquidationAddressesSection - Existing component
```

### Custom Hooks:
- `useWalletData(walletId, customerId, limit)` - Single data loader
- `useProgressiveFetch()` - Reusable progressive fetching
- `useParallelFetch()` - Reusable parallel fetching
- `useClipboard()` - Clipboard operations

### Benefits:
- Single data loading path
- No duplicate API calls
- Easier to test
- Easier to understand
- Shorter files
- Reusable logic

---

## Summary

This component is overly complex due to:
1. **3 different data loading approaches** (loadData, loadAllWalletData, useEffects)
2. **4 separate useEffects** with overlapping responsibilities
3. **Massive code duplication** in fetching logic
4. **600+ lines** in a single file
5. **21+ state variables** to track
6. **Indirect state dependencies** causing cascading effects

The component works but is extremely difficult to maintain, debug, and extend. A comprehensive refactor is strongly recommended.
