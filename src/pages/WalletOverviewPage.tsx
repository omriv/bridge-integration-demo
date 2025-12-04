import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import type { LiquidationAddress, WalletTransaction, Transfer, LiquidationHistory } from '../types';
import { JsonViewerModal } from '../components/JsonViewerModal';

export function WalletOverviewPage() {
  const { walletId } = useParams<{ walletId: string }>();
  const navigate = useNavigate();
  const { wallets, loadWalletData, refreshAll } = useData();
  
  const wallet = wallets.find(w => w.id === walletId);
  
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
  const [isLiquidationCollapsed, setIsLiquidationCollapsed] = useState(false);
  const [isTransactionsCollapsed, setIsTransactionsCollapsed] = useState(false);
  const [isWalletTxCollapsed, setIsWalletTxCollapsed] = useState(false);
  const [isTransfersCollapsed, setIsTransfersCollapsed] = useState(false);
  const [isLiquidationHistoryCollapsed, setIsLiquidationHistoryCollapsed] = useState(false);
  
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
    if (walletId && wallet) {
      loadData();
    }
  }, [walletId]);

  const loadData = async () => {
    if (!walletId || !wallet) return;
    
    try {
      setLoading(true);
      const data = await loadWalletData(walletId, wallet.address);
      
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

  // Get breakdown of chain+currency combinations
  const getChainCurrencyBreakdown = () => {
    const breakdown = new Map<string, number>();
    liquidationAddresses.forEach((la) => {
      const key = `${la.chain}+${la.currency}`;
      breakdown.set(key, (breakdown.get(key) || 0) + 1);
    });
    return Array.from(breakdown.entries()).map(([combo, count]) => ({ combo, count }));
  };

  if (!wallet && !loading) {
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
                  {/* Wallet Transaction History */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <button
                        onClick={() => setIsWalletTxCollapsed(!isWalletTxCollapsed)}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                      >
                        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                          <span className="mr-1.5">💳</span>
                          Wallet Transactions ({walletTransactions.length})
                        </h3>
                        <svg
                          className={`w-4 h-4 text-gray-600 transition-transform ${isWalletTxCollapsed ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {walletTransactions.length > 0 && (
                        <button
                          onClick={() => openJsonModal('Wallet Transactions - Full Response', walletTransactionsRaw)}
                          className="px-2 py-1 bg-gray-800 text-green-400 rounded text-xs font-semibold hover:bg-gray-700"
                        >
                          View Full JSON
                        </button>
                      )}
                    </div>
                    {!isWalletTxCollapsed && (
                      walletTransactions.length === 0 ? (
                        <p className="text-gray-500 text-sm italic">No wallet transactions found</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full bg-white border border-gray-200 rounded text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Amount</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Source</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Destination</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Fee</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Created</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {walletTransactions.map((tx, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                  <td className="px-3 py-2 font-semibold text-gray-900">{tx.amount}</td>
                                  <td className="px-3 py-2">
                                    <div className="font-medium text-gray-900">{tx.source.currency.toUpperCase()}</div>
                                    <div className="text-gray-500 text-xs">{tx.source.payment_rail}</div>
                                  </td>
                                  <td className="px-3 py-2">
                                    <div className="font-medium text-gray-900">{tx.destination.currency.toUpperCase()}</div>
                                    <div className="text-gray-500 text-xs">{tx.destination.payment_rail}</div>
                                  </td>
                                  <td className="px-3 py-2 text-gray-900">{tx.developer_fee}</td>
                                  <td className="px-3 py-2 text-gray-600 text-xs">{new Date(tx.created_at).toLocaleString()}</td>
                                  <td className="px-3 py-2">
                                    <button
                                      onClick={() => openJsonModal(`Transaction #${idx + 1}`, tx)}
                                      className="px-2 py-0.5 bg-gray-800 text-green-400 rounded text-xs font-semibold hover:bg-gray-700"
                                    >
                                      JSON
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )
                    )}
                  </div>

                  {/* Transfer History */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <button
                        onClick={() => setIsTransfersCollapsed(!isTransfersCollapsed)}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                      >
                        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                          <span className="mr-1.5">🔄</span>
                          Transfers ({transfers.length})
                        </h3>
                        <svg
                          className={`w-4 h-4 text-gray-600 transition-transform ${isTransfersCollapsed ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {transfers.length > 0 && (
                        <button
                          onClick={() => openJsonModal('Transfers - Full Response', transfersRaw)}
                          className="px-2 py-1 bg-gray-800 text-green-400 rounded text-xs font-semibold hover:bg-gray-700"
                        >
                          View Full JSON
                        </button>
                      )}
                    </div>
                    {!isTransfersCollapsed && (
                      transfers.length === 0 ? (
                        <p className="text-gray-500 text-sm italic">No transfers found</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full bg-white border border-gray-200 rounded text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">ID</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">State</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Amount</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Source</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Destination</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Fee</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Created</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {transfers.map((transfer) => (
                                <tr key={transfer.id} className="hover:bg-gray-50">
                                  <td className="px-3 py-2 text-xs font-mono text-gray-600">{transfer.id.substring(0, 8)}...</td>
                                  <td className="px-3 py-2">
                                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                                      transfer.state === 'payment_processed' ? 'bg-green-100 text-green-800' :
                                      transfer.state === 'awaiting_funds' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {transfer.state.replace(/_/g, ' ').toUpperCase()}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 font-semibold text-gray-900">{transfer.amount} {transfer.currency.toUpperCase()}</td>
                                  <td className="px-3 py-2">
                                    <div className="font-medium text-gray-900">{transfer.source.currency.toUpperCase()}</div>
                                    <div className="text-gray-500 text-xs">{transfer.source.payment_rail}</div>
                                  </td>
                                  <td className="px-3 py-2">
                                    <div className="font-medium text-gray-900">{transfer.destination.currency.toUpperCase()}</div>
                                    <div className="text-gray-500 text-xs">{transfer.destination.payment_rail}</div>
                                  </td>
                                  <td className="px-3 py-2 text-gray-900">{transfer.developer_fee}</td>
                                  <td className="px-3 py-2 text-gray-600 text-xs">{new Date(transfer.created_at).toLocaleString()}</td>
                                  <td className="px-3 py-2">
                                    <button
                                      onClick={() => openJsonModal(`Transfer ${transfer.id.substring(0, 8)}`, transfer)}
                                      className="px-2 py-0.5 bg-gray-800 text-green-400 rounded text-xs font-semibold hover:bg-gray-700"
                                    >
                                      JSON
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )
                    )}
                  </div>

                  {/* Liquidation History */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <button
                        onClick={() => setIsLiquidationHistoryCollapsed(!isLiquidationHistoryCollapsed)}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                      >
                        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                          <span className="mr-1.5">💧</span>
                          Liquidation History ({liquidationHistory.length})
                        </h3>
                        <svg
                          className={`w-4 h-4 text-gray-600 transition-transform ${isLiquidationHistoryCollapsed ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {liquidationHistory.length > 0 && (
                        <button
                          onClick={() => openJsonModal('Liquidation History - Full Response', liquidationHistoryRaw)}
                          className="px-2 py-1 bg-gray-800 text-green-400 rounded text-xs font-semibold hover:bg-gray-700"
                        >
                          View Full JSON
                        </button>
                      )}
                    </div>
                    {!isLiquidationHistoryCollapsed && (
                      liquidationHistory.length === 0 ? (
                        <p className="text-gray-500 text-sm italic">No liquidation history found</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full bg-white border border-gray-200 rounded text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">ID</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">State</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Amount</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Currency</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Source Rail</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">From Address</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Deposit TX</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Created</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {liquidationHistory.map((lh) => (
                                <tr key={lh.id} className="hover:bg-gray-50">
                                  <td className="px-3 py-2 text-xs font-mono text-gray-600">{lh.id.substring(0, 8)}...</td>
                                  <td className="px-3 py-2">
                                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                                      lh.state === 'payment_processed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                      {lh.state.replace(/_/g, ' ').toUpperCase()}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 font-semibold text-gray-900">{lh.amount}</td>
                                  <td className="px-3 py-2 font-medium text-gray-900">{lh.currency.toUpperCase()}</td>
                                  <td className="px-3 py-2 text-gray-700">{lh.source_payment_rail}</td>
                                  <td className="px-3 py-2 text-xs font-mono text-gray-600">{lh.from_address.substring(0, 12)}...</td>
                                  <td className="px-3 py-2 text-xs font-mono text-gray-600">{lh.deposit_tx_hash.substring(0, 12)}...</td>
                                  <td className="px-3 py-2 text-gray-600 text-xs">{new Date(lh.created_at).toLocaleString()}</td>
                                  <td className="px-3 py-2">
                                    <button
                                      onClick={() => openJsonModal(`Liquidation ${lh.id.substring(0, 8)}`, lh)}
                                      className="px-2 py-0.5 bg-gray-800 text-green-400 rounded text-xs font-semibold hover:bg-gray-700"
                                    >
                                      JSON
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Liquidation Addresses Section */}
            <div className="bg-white rounded-lg shadow">
              <button
                onClick={() => setIsLiquidationCollapsed(!isLiquidationCollapsed)}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
              >
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <span className="mr-2">🏦</span>
                  Liquidation Addresses ({liquidationAddresses.length})
                </h2>
                <svg
                  className={`w-5 h-5 text-gray-600 transition-transform ${isLiquidationCollapsed ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {!isLiquidationCollapsed && (
                <div className="p-4 border-t border-gray-200">
                  {liquidationAddresses.length === 0 ? (
                    <p className="text-gray-500 text-sm italic text-center py-4">
                      No liquidation addresses found for this wallet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {/* Chain + Currency Breakdown */}
                      <div className="bg-blue-50 rounded p-3 border border-blue-200">
                        <h4 className="text-xs font-semibold text-blue-900 mb-2">Chain + Currency Combinations</h4>
                        <div className="flex flex-wrap gap-2">
                          {getChainCurrencyBreakdown().map(({ combo, count }) => (
                            <span
                              key={combo}
                              className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold border border-blue-300"
                            >
                              {combo.toUpperCase()} ({count})
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Liquidation Address Cards - Compact */}
                      {liquidationAddresses.map((la) => (
                        <div
                          key={la.id}
                          className="bg-white rounded border border-gray-200 hover:border-indigo-300 transition-colors p-3"
                        >
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                            <div>
                              <p className="text-gray-500 mb-0.5">ID</p>
                              <div className="flex items-center gap-1">
                                <p className="font-mono text-gray-900 truncate flex-1">{la.id.substring(0, 12)}...</p>
                                <button
                                  onClick={() => copyToClipboard(la.id, `la-id-${la.id}`)}
                                  className="p-0.5 text-gray-600 hover:text-indigo-600 flex-shrink-0"
                                >
                                  {copiedField === `la-id-${la.id}` ? (
                                    <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  ) : (
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            </div>

                            <div>
                              <p className="text-gray-500 mb-0.5">Address</p>
                              <div className="flex items-center gap-1">
                                <p className="font-mono text-gray-900 truncate flex-1">{la.address.substring(0, 12)}...</p>
                                <button
                                  onClick={() => copyToClipboard(la.address, `la-addr-${la.id}`)}
                                  className="p-0.5 text-gray-600 hover:text-indigo-600 flex-shrink-0"
                                >
                                  {copiedField === `la-addr-${la.id}` ? (
                                    <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  ) : (
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            </div>

                            <div>
                              <p className="text-gray-500 mb-0.5">Chain</p>
                              <p className="font-semibold text-gray-900 uppercase">{la.chain}</p>
                            </div>

                            <div>
                              <p className="text-gray-500 mb-0.5">Currency</p>
                              <p className="font-semibold text-gray-900 uppercase">{la.currency}</p>
                            </div>

                            <div>
                              <p className="text-gray-500 mb-0.5">Dest. Rail</p>
                              <p className="font-semibold text-gray-900 uppercase">{la.destination_payment_rail}</p>
                            </div>

                            <div>
                              <p className="text-gray-500 mb-0.5">Dest. Currency</p>
                              <p className="font-semibold text-gray-900 uppercase">{la.destination_currency}</p>
                            </div>

                            <div>
                              <p className="text-gray-500 mb-0.5">State</p>
                              <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                                la.state === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {la.state.toUpperCase()}
                              </span>
                            </div>

                            <div>
                              <p className="text-gray-500 mb-0.5">Created</p>
                              <p className="text-gray-900">{new Date(la.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
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
