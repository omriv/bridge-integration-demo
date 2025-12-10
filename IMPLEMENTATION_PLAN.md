# Implementation Plan: DataContext Refactoring

This document outlines the steps to refactor `src/context/DataContext.tsx` and `src/pages/HomePage.tsx` to improve code consistency, remove dead code, and centralize virtual account management.

## Phase 1: DataContext Refactoring

### 1. Update `DataContextType` Interface
Modify `src/context/DataContext.tsx` to include virtual accounts in the context state.

```typescript
interface DataContextType {
  // ... existing state
  virtualAccounts: VirtualAccount[];
  virtualAccountsLoading: boolean;
  
  // ... existing functions
}
```

### 2. Update `DataProvider` State
Add state variables for virtual accounts inside `DataProvider`.

```typescript
export function DataProvider({ children }: { children: ReactNode }) {
  // ... existing state
  const [virtualAccounts, setVirtualAccounts] = useState<VirtualAccount[]>([]);
  const [virtualAccountsLoading, setVirtualAccountsLoading] = useState(false);
  
  // ...
}
```

### 3. Refactor `loadCustomerData`
Update `loadCustomerData` to:
1.  Use the pure fetch functions (`fetchCustomer`, `fetchCustomerWallets`, `fetchLiquidationAddresses`) instead of direct `bridgeAPI` calls.
2.  Fetch virtual accounts in parallel with other customer data.
3.  Handle virtual account loading state.

```typescript
  const loadCustomerData = useCallback(async (customerId?: string) => {
    const customerIdToUse = customerId || currentCustomerId;
    
    // ... (validation logic)
    
    try {
      setLoading(true);
      setVirtualAccountsLoading(true); // Start VA loading
      setError(null);

      // Fetch all data in parallel using pure fetch functions
      const [customerData, walletsData, liquidationData, virtualAccountsData] = await Promise.all([
        fetchCustomer(customerIdToUse),
        fetchCustomerWallets(customerIdToUse),
        fetchLiquidationAddresses(customerIdToUse),
        fetchVirtualAccounts(customerIdToUse)
      ]);

      setCustomer(customerData);
      setWallets(walletsData);
      setLiquidationAddresses(liquidationData);
      setVirtualAccounts(virtualAccountsData);
      
      // ... (loadCustomers logic)
    } catch (err) {
      // ... (error handling logic)
      // Ensure virtualAccounts are reset on error/404
      setVirtualAccounts([]);
    } finally {
      setLoading(false);
      setVirtualAccountsLoading(false);
    }
  }, [currentCustomerId, customers.length]);
```

### 4. Remove Dead Code
Delete the `loadCustomerBasicData` function from `src/context/DataContext.tsx`.

### 5. Update Context Provider Value
Add `virtualAccounts` and `virtualAccountsLoading` to the `value` object passed to `DataContext.Provider`.

## Phase 2: HomePage Refactoring

### 1. Update `HomePage.tsx`
Modify `src/pages/HomePage.tsx` to consume virtual accounts from context.

1.  Remove local state:
    ```typescript
    // Remove these
    const [virtualAccounts, setVirtualAccounts] = useState<VirtualAccount[]>([]);
    const [virtualAccountsLoading, setVirtualAccountsLoading] = useState(false);
    ```
2.  Update `useData` destructuring:
    ```typescript
    const { 
      // ... existing
      virtualAccounts, 
      virtualAccountsLoading 
    } = useData();
    ```
3.  Remove the `useEffect` that loads virtual accounts:
    ```typescript
    // Remove this effect
    useEffect(() => {
      const loadVirtualAccounts = async () => { ... }
      loadVirtualAccounts();
    }, [customer]);
    ```

## Phase 3: Cleanup
1.  Ensure `toggleMock` clears `virtualAccounts` state as well.
2.  Ensure `refreshAll` triggers a reload that includes virtual accounts (it calls `loadCustomerData`, so it should be covered).

## Verification Checklist
- [ ] `loadCustomerBasicData` is removed.
- [ ] `DataProvider` uses `fetchCustomer`, `fetchCustomerWallets`, etc.
- [ ] Virtual accounts are loaded via `loadCustomerData`.
- [ ] `HomePage` no longer manages virtual account state locally.
- [ ] Switching customers updates virtual accounts.
- [ ] Mock mode toggle clears and reloads virtual accounts.
