# DataContext.tsx Analysis

## Overview
The `src/context/DataContext.tsx` file serves as the central state management and data fetching layer for the application. It implements the React Context API to provide customer data, wallets, liquidation addresses, and configuration settings (like mock mode) to the entire component tree.

## Key Components

### 1. Pure Fetch Functions
These are standalone asynchronous functions that wrap `bridgeAPI` calls. They are designed to be stateless and return promises, making them easy to test and reuse.

*   **`fetchCustomer(id)`**: Fetches a single customer by ID.
    *   *Status*: Defined but **unused** in `DataProvider`. The provider calls `bridgeAPI.getCustomer` directly.
*   **`fetchAllCustomers()`**: Fetches the list of all customers.
    *   *Status*: Used in `loadCustomers`.
*   **`fetchCustomerWallets(id)`**: Fetches wallets for a specific customer.
    *   *Status*: Defined but **unused** in `DataProvider`. The provider calls `bridgeAPI.getCustomerWallets` directly.
*   **`fetchLiquidationAddresses(id)`**: Fetches liquidation addresses for a customer.
    *   *Status*: Defined but **unused** in `DataProvider`. The provider calls `bridgeAPI.getLiquidationAddresses` directly.
*   **`fetchWalletTransactions(walletId)`**: Fetches transactions for a specific wallet.
    *   *Status*: Exported and likely intended for use in child components (e.g., `WalletCard` or transaction tables).
*   **`fetchLiquidationHistory(addressId)`**: Fetches liquidation history for a specific address.
    *   *Status*: Exported for use in child components.
*   **`fetchVirtualAccountActivity(virtualAccountId)`**: Fetches activity for a virtual account.
    *   *Status*: Exported for use in child components.
*   **`fetchVirtualAccounts(customerId)`**: Fetches virtual accounts for a customer.
    *   *Status*: **Dead Code**. It is exported but not used. `HomePage.tsx` calls `bridgeAPI.getVirtualAccounts` directly.

### 2. Progressive Fetching
*   **`fetchTransfersProgressive`**: Implements a smart polling mechanism to fetch transfers. It fetches pages sequentially until a limit is reached or enough filtered results are found. This handles API pagination and filtering limitations effectively.

### 3. Parallel Fetching
*   **`fetchLiquidationHistoryParallel`**: Uses `Promise.all` to fetch history for multiple addresses concurrently, improving performance.
*   **`fetchVirtualAccountActivityParallel`**: Uses `Promise.all` to fetch activity for multiple virtual accounts concurrently.
*   **`loadCustomerBasicData`**: A composite function designed to fetch customer details, wallets, and liquidation addresses in parallel.
    *   *Status*: **Dead Code**. This function is exported but **never used**. The `DataProvider` implements its own parallel fetching logic inside `loadCustomerData` instead of using this helper.

### 4. DataProvider Component
The main component that holds the application state:
*   **State**: `customer`, `customers`, `wallets`, `liquidationAddresses`, `loading`, `error`, `useMock`.
*   **`loadCustomerData`**: The primary effect function. It fetches customer data, wallets, and liquidation addresses in parallel. It handles 404 errors by falling back to the customer list.
*   **`toggleMock`**: Switches between mock and real data, persisting the choice to `localStorage` and reloading the page context.

## Issues & Recommendations

### 1. Dead Code
The following functions are defined and exported but appear to be unused in the current codebase:
*   `loadCustomerBasicData`: The logic inside `DataProvider` duplicates this function's purpose.
*   `fetchVirtualAccounts`: `HomePage.tsx` bypasses this and uses the API directly.

**Recommendation**: Remove these functions or refactor the application to use them, ensuring a single source of truth for data fetching logic.

### 2. Inconsistent Implementation
The `DataProvider` does not consistently use the "Pure Fetch Functions" defined at the top of the file. For example, `loadCustomerData` calls `bridgeAPI.getCustomer` directly instead of using `fetchCustomer`.

**Recommendation**: Refactor `loadCustomerData` to use the pure fetch functions (`fetchCustomer`, `fetchCustomerWallets`, etc.). This would make the code cleaner and more consistent.

### 3. Virtual Accounts Logic Separation
Virtual accounts are currently fetched inside `HomePage.tsx` and not managed by the global `DataContext`, unlike wallets and liquidation addresses.

**Recommendation**: Consider moving `virtualAccounts` state into `DataContext` to unify data management, especially if virtual accounts are needed in other parts of the app (like the Developer Account page).

### 4. Error Handling
The `loadCustomerData` function has robust error handling (checking for 404s), which is good. However, the individual fetch functions lack specific error handling wrappers, relying on the caller to catch errors.

## Conclusion
The `DataContext.tsx` file is well-structured with a clear separation between pure data fetching and state management. However, recent refactoring seems to have left behind some unused utility functions (`loadCustomerBasicData`) and inconsistent usage patterns. Cleaning up the dead code and unifying the fetching logic would improve maintainability.
