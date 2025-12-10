import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import type { Wallet, WalletTransaction, Transfer, LiquidationHistory, VirtualAccountActivity, LiquidationAddress } from '../types';
import { JsonViewerModal } from '../components/JsonViewerModal';
import { DynamicTransactionsTable } from '../components/DynamicTransactionsTable';
import { createTransfersTableColumns } from '../components/tableConfigs/transfersTableConfig';
import { createLiquidationHistoryTableColumns } from '../components/tableConfigs/liquidationHistoryTableConfig';
import { createWalletTransactionsTableColumns } from '../components/tableConfigs/walletTransactionsTableConfig';
import { createVirtualAccountActivityTableColumns } from '../components/tableConfigs/virtualAccountActivityTableConfig';
import { LiquidationAddressesSection } from '../components/LiquidationAddressesSection';

// Helper function to filter transfers related to a wallet
function filterWalletTransfers(
  transfers: Transfer[], 
  walletId: string | undefined, 
  walletAddress: string | undefined
): Transfer[] {
  return transfers.filter((transfer) => {
    const walletAddr = walletAddress?.toLowerCase();
    const walletIdMatch = transfer.source.bridge_wallet_id === walletId;
    const sourceAddrMatch = transfer.source.from_address?.toLowerCase() === walletAddr;
    return walletIdMatch || sourceAddrMatch;
  });
}

function filterLiquidationAddresses(
  liquidationAddresses: LiquidationAddress[], 
  walletAddress: string | undefined
): LiquidationAddress[] {
  return liquidationAddresses.filter((liquidationAddress) => {
    const walletAddr = walletAddress?.toLowerCase();
    return liquidationAddress.destination_address.toLowerCase() === walletAddr;
  });
}

export function WalletOverviewPage() {
  const { customerId, walletId } = useParams<{ customerId: string; walletId: string }>();
  const navigate = useNavigate();
  const { 
    refreshAll, 
    customer, 
    loadCustomerData, 
    virtualAccounts,
    fetchWallet,
    fetchWalletTransactions,
    fetchTransfersProgressive,
    fetchWalletLiquidationAddressesProgressive,
    fetchLiquidationHistoryParallel,
    fetchVirtualAccountActivityParallel
  } = useData();
  
  // Limit state
  const [limit, setLimit] = useState<number>(10);
  const [limitInput, setLimitInput] = useState<string>('10');
  
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [walletNotFound, setWalletNotFound] = useState(false);
  const [liquidationAddressesLoaded, setLiquidationAddressesLoaded] = useState(false);
  
  const [ walletLiquidationAddresses, setWalletLiquidationAddresses] = useState<LiquidationAddress[]>([]);

  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [liquidationHistory, setLiquidationHistory] = useState<LiquidationHistory[]>([]);
  const [virtualAccountActivity, setVirtualAccountActivity] = useState<VirtualAccountActivity[]>([]);
  
  // Store raw API responses for JSON viewer
  const [walletTransactionsRaw, setWalletTransactionsRaw] = useState<unknown>(null);
  const [transfersRaw, setTransfersRaw] = useState<unknown>(null);
  const [liquidationHistoryRaw, setLiquidationHistoryRaw] = useState<unknown>(null);
  const [virtualAccountActivityRaw, setVirtualAccountActivityRaw] = useState<unknown>(null);
  
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Collapse states for each table
  const [isTransactionsCollapsed, setIsTransactionsCollapsed] = useState(false);
  const [isWalletTxCollapsed, setIsWalletTxCollapsed] = useState(true);
  const [isTransfersCollapsed, setIsTransfersCollapsed] = useState(true);
  const [isLiquidationHistoryCollapsed, setIsLiquidationHistoryCollapsed] = useState(true);
  const [isVirtualAccountActivityCollapsed, setIsVirtualAccountActivityCollapsed] = useState(true);
  
  // Individual loading states for each table
  const [isWalletTxLoading, setIsWalletTxLoading] = useState(false);
  const [isTransfersLoading, setIsTransfersLoading] = useState(false);
  const [isLiquidationHistoryLoading, setIsLiquidationHistoryLoading] = useState(false);
  const [isVirtualAccountActivityLoading, setIsVirtualAccountActivityLoading] = useState(false);
  
  // JSON viewer modal state
  const [jsonModalOpen, setJsonModalOpen] = useState(false);
  const [jsonModalTitle, setJsonModalTitle] = useState('');
  const [jsonModalData, setJsonModalData] = useState<unknown>(null);
  
  // Track if initial load is complete to prevent duplicate API calls
  const hasLoadedRef = useRef(false);

  const copyToClipboard = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const openJsonModal = (title: string, data: unknown) => {
    setJsonModalTitle(title);
    setJsonModalData(data);
    setJsonModalOpen(true);
  };

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

  const loadAllWalletData = async () => {
    if (!wallet || !walletId || !customerId) return;
    
    try {
      // Filter function for transfers
      const filterTransfersByWallet = (transfers: Transfer[]) => {
        return filterWalletTransfers(transfers, walletId, wallet.address);
      };
            
      // Filter virtual accounts for this wallet
      const walletVirtualAccounts = virtualAccounts.filter(
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

  // Track previous limit to only reload when limit actually changes
  const prevLimitRef = useRef(limit);

  useEffect(() => {
    // Only reload if limit actually changed (not just component re-render)
    if (limit !== prevLimitRef.current && wallet && walletId && customerId && hasLoadedRef.current) {
      loadAllWalletData();
      prevLimitRef.current = limit;
    }
  }, [limit, wallet, walletId, customerId]);

  useEffect(() => {
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
        let walletToLoad = await fetchWallet(customerId, walletId);
        
        if (!walletToLoad) {
          setWalletNotFound(true);
          return;
        }
        
        // Set wallet - this will trigger the limit effect to load data
        setWallet(walletToLoad);

        // Load Liquidation Addresses
        const filterLiquidationAddressesByWallet = (liquidationAddresses: LiquidationAddress[]) => {
          return filterLiquidationAddresses(liquidationAddresses, walletToLoad.address);
        };
        const laResult = await fetchWalletLiquidationAddressesProgressive(customerId, limit, filterLiquidationAddressesByWallet);
        setWalletLiquidationAddresses(laResult);
        setLiquidationAddressesLoaded(true);
        
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

  // Load wallet data once wallet is set and ready
  useEffect(() => {
    if (wallet && walletId && customerId && hasLoadedRef.current && liquidationAddressesLoaded) {
      loadAllWalletData();
    }
  }, [wallet, liquidationAddressesLoaded]);

  const handleRefresh = async () => {
    if (!wallet || !walletId || !customerId) return;
    
    await refreshAll();
    // Reset loaded state to trigger reload
    setLiquidationAddressesLoaded(false);
    
    // Reload liquidation addresses
    const filterLiquidationAddressesByWallet = (liquidationAddresses: LiquidationAddress[]) => {
      return filterLiquidationAddresses(liquidationAddresses, wallet.address);
    };
    const laResult = await fetchWalletLiquidationAddressesProgressive(customerId, limit, filterLiquidationAddressesByWallet);
    setWalletLiquidationAddresses(laResult);
    setLiquidationAddressesLoaded(true);
  };
  

  if ((walletNotFound || !wallet) && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Wallet Not Found</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-semibold">Back</span>
          </button>
          
          <div className="flex-1 mx-4">
            <h1 className="text-xl font-bold">Wallet Overview</h1>
            {wallet && (
              <div className="flex items-center gap-3 text-sm opacity-90">
                <span className="font-semibold">{wallet.chain.toUpperCase()}</span>
                <span className="font-mono text-xs">{wallet.address.substring(0, 20)}...</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Limit Input */}
            <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
              <label htmlFor="limit-input" className="text-sm font-semibold whitespace-nowrap">
                Max Items:
              </label>
              <input
                id="limit-input"
                type="number"
                min="10"
                max="100"
                value={limitInput}
                onChange={(e) => setLimitInput(e.target.value)}
                onBlur={handleLimitBlur}
                className="w-16 px-2 py-1 text-sm text-gray-900 bg-white rounded border-0 focus:ring-2 focus:ring-white/50 outline-none"
              />
            </div>

            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/20 rounded-lg transition-colors"
              title="Refresh all data"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="font-semibold">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-600">Loading...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Transactions Section */}
            <div className="bg-white rounded-lg shadow">
              <button
                onClick={() => setIsTransactionsCollapsed(!isTransactionsCollapsed)}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
              >
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <span className="mr-2">📊</span>
                  Recent Transactions
                </h2>
                <svg
                  className={`w-5 h-5 text-gray-600 transition-transform ${isTransactionsCollapsed ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {!isTransactionsCollapsed && (
                <div className="p-4 space-y-4 border-t border-gray-200">
                  {/* Wallet Transactions */}
                  <DynamicTransactionsTable
                    title="Wallet Transactions"
                    icon="💳"
                    items={walletTransactions}
                    columns={createWalletTransactionsTableColumns(openJsonModal)}
                    onViewRawJson={() => openJsonModal('Wallet Transactions - Full Response', walletTransactionsRaw)}
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
                    isLoading={isWalletTxLoading}
                    collapsed={isWalletTxCollapsed}
                    onCollapsedChange={setIsWalletTxCollapsed}
                  />

                  {/* Transfers */}
                  <DynamicTransactionsTable
                    title="Transfers"
                    icon="🔄"
                    items={filterWalletTransfers(transfers, walletId, wallet?.address)}
                    columns={createTransfersTableColumns(
                      walletId,
                      wallet?.address,
                      copiedField,
                      copyToClipboard,
                      openJsonModal
                    )}
                    onViewRawJson={() => openJsonModal('Transfers - Full Response', transfersRaw)}
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
                    isLoading={isTransfersLoading}
                    collapsed={isTransfersCollapsed}
                    onCollapsedChange={setIsTransfersCollapsed}
                  />

                  {/* Liquidation History */}
                  <DynamicTransactionsTable
                    title="Liquidation History"
                    icon="💧"
                    items={liquidationHistory}
                    columns={createLiquidationHistoryTableColumns(openJsonModal)}
                    onViewRawJson={() => openJsonModal('Liquidation History - Full Response', liquidationHistoryRaw)}
                    onReload={async () => {
                      if (!wallet) return;
                      
                      setIsLiquidationHistoryCollapsed(false);
                      setIsLiquidationHistoryLoading(true);
                      
                      try {
                        const result = await fetchLiquidationHistoryParallel(walletLiquidationAddresses, limit);
                        setLiquidationHistory(result.data);
                        setLiquidationHistoryRaw(result.raw);
                      } catch (error) {
                        console.error('Error reloading liquidation history:', error);
                      } finally {
                        setIsLiquidationHistoryLoading(false);
                      }
                    }}
                    isLoading={isLiquidationHistoryLoading}
                    collapsed={isLiquidationHistoryCollapsed}
                    onCollapsedChange={setIsLiquidationHistoryCollapsed}
                  />

                  {/* Virtual Account Activity */}
                  <DynamicTransactionsTable
                    title="Virtual Account Activity"
                    icon="🏦"
                    items={virtualAccountActivity}
                    columns={createVirtualAccountActivityTableColumns(copiedField, copyToClipboard, openJsonModal)}
                    onViewRawJson={() => openJsonModal('Virtual Account Activity - Full Response', virtualAccountActivityRaw)}
                    onReload={async () => {
                      if (!wallet || !customerId) return;
                      
                      setIsVirtualAccountActivityCollapsed(false);
                      setIsVirtualAccountActivityLoading(true);
                      
                      try {
                        const walletAccounts = virtualAccounts.filter(
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
                    isLoading={isVirtualAccountActivityLoading}
                    collapsed={isVirtualAccountActivityCollapsed}
                    onCollapsedChange={setIsVirtualAccountActivityCollapsed}
                  />
                </div>
              )}
            </div>

            {/* Liquidation Addresses Section */}
            <LiquidationAddressesSection
              liquidationAddresses={walletLiquidationAddresses}
              copiedField={copiedField}
              onCopy={copyToClipboard}
            />
          </div>
        )}
      </div>

      {/* JSON Viewer Modal */}
      <JsonViewerModal
        isOpen={jsonModalOpen}
        onClose={() => setJsonModalOpen(false)}
        title={jsonModalTitle}
        data={jsonModalData}
      />
    </div>
  );
}
