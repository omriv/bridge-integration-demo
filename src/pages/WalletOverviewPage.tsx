import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { bridgeAPI } from '../services/bridgeAPI';
import type { Wallet, LiquidationAddress, WalletTransaction, Transfer, LiquidationHistory } from '../types';
import { JsonViewerModal } from '../components/JsonViewerModal';
import { DynamicTransactionsTable } from '../components/DynamicTransactionsTable';
import { createTransfersTableColumns } from '../components/tableConfigs/transfersTableConfig';
import { createLiquidationHistoryTableColumns } from '../components/tableConfigs/liquidationHistoryTableConfig';
import { createWalletTransactionsTableColumns } from '../components/tableConfigs/walletTransactionsTableConfig';
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
    const destAddrMatch = transfer.destination.to_address?.toLowerCase() === walletAddr;
    return walletIdMatch || sourceAddrMatch || destAddrMatch;
  });
}

export function WalletOverviewPage() {
  const { customerId, walletId } = useParams<{ customerId: string; walletId: string }>();
  const navigate = useNavigate();
  const { wallets, loadWalletData, refreshAll, customer, loadCustomerData } = useData();
  
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [walletNotFound, setWalletNotFound] = useState(false);
  
  const [liquidationAddresses, setLiquidationAddresses] = useState<LiquidationAddress[]>([]);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [liquidationHistory, setLiquidationHistory] = useState<LiquidationHistory[]>([]);
  
  // Store raw API responses for JSON viewer
  const [walletTransactionsRaw, setWalletTransactionsRaw] = useState<unknown>(null);
  const [transfersRaw, setTransfersRaw] = useState<unknown>(null);
  const [liquidationHistoryRaw, setLiquidationHistoryRaw] = useState<unknown>(null);
  
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isTransactionsCollapsed, setIsTransactionsCollapsed] = useState(false);
  
  // JSON viewer modal state
  const [jsonModalOpen, setJsonModalOpen] = useState(false);
  const [jsonModalTitle, setJsonModalTitle] = useState('');
  const [jsonModalData, setJsonModalData] = useState<unknown>(null);

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

  useEffect(() => {
    const initWallet = async () => {
      if (!walletId || !customerId) return;
      
      // Load customer data if not already loaded
      if (!customer || customer.id !== customerId) {
        try {
          setLoading(true);
          await loadCustomerData(customerId);
        } catch (error) {
          console.error('Error loading customer:', error);
          setWalletNotFound(true);
          setLoading(false);
          return;
        }
      }
      
      // First check if wallet is in context
      const walletFromContext = wallets.find(w => w.id === walletId);
      if (walletFromContext) {
        setWallet(walletFromContext);
        loadData(walletFromContext);
        return;
      }
      
      // If not in context, fetch wallet data from API
      try {
        setLoading(true);
        const walletsData = await bridgeAPI.getCustomerWallets(customerId);
        const foundWallet = walletsData.data.find(w => w.id === walletId);
        
        if (foundWallet) {
          setWallet(foundWallet);
          await loadData(foundWallet);
        } else {
          setWalletNotFound(true);
        }
      } catch (error) {
        console.error('Error fetching wallet:', error);
        setWalletNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    
    initWallet();
  }, [walletId, customerId, wallets, customer]);

  const loadData = async (walletToLoad?: Wallet) => {
    const targetWallet = walletToLoad || wallet;
    if (!walletId || !targetWallet) return;
    
    try {
      setLoading(true);
      const data = await loadWalletData(walletId, targetWallet.address);
      
      setLiquidationAddresses(data.liquidationAddresses);
      setWalletTransactions(data.transactions);
      setWalletTransactionsRaw(data.transactionsRaw);
      setTransfers(data.transfers);
      setTransfersRaw(data.transfersRaw);
      setLiquidationHistory(data.liquidationHistory);
      setLiquidationHistoryRaw(data.liquidationHistoryRaw);
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await refreshAll();
    if (walletId && wallet) {
      await loadData();
    }
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
                      if (wallet) {
                        await loadData();
                      }
                    }}
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
                      if (wallet) {
                        await loadData();
                      }
                    }}
                  />

                  {/* Liquidation History */}
                  <DynamicTransactionsTable
                    title="Liquidation History"
                    icon="💧"
                    items={liquidationHistory}
                    columns={createLiquidationHistoryTableColumns(openJsonModal)}
                    onViewRawJson={() => openJsonModal('Liquidation History - Full Response', liquidationHistoryRaw)}
                    onReload={async () => {
                      if (wallet) {
                        await loadData();
                      }
                    }}
                  />
                </div>
              )}
            </div>

            {/* Liquidation Addresses Section */}
            <LiquidationAddressesSection
              liquidationAddresses={liquidationAddresses}
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
