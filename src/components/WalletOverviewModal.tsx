import { useState, useEffect } from 'react';
import { bridgeAPI } from '../services/bridgeAPI';
import { config } from '../config';
import type { LiquidationAddress, WalletTransaction, Transfer, LiquidationHistory } from '../types';
import { JsonViewerModal } from './JsonViewerModal';

interface WalletOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletId: string;
  walletAddress: string;
  walletChain: string;
}

export function WalletOverviewModal({ isOpen, onClose, walletId, walletAddress, walletChain }: WalletOverviewModalProps) {
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
  const [isLiquidationCollapsed, setIsLiquidationCollapsed] = useState(true);
  const [isTransactionsCollapsed, setIsTransactionsCollapsed] = useState(true);
  
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
    if (isOpen) {
      loadAllData();
    }
  }, [isOpen, walletAddress, walletId]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch liquidation addresses
      const liquidationResponse = await bridgeAPI.getLiquidationAddresses(config.customerId);
      const filteredLiquidation = liquidationResponse.data.filter(
        (la) => la.destination_address.toLowerCase() === walletAddress.toLowerCase()
      );
      setLiquidationAddresses(filteredLiquidation);

      // Fetch wallet transactions (handle 404 gracefully)
      try {
        const walletTxResponse = await bridgeAPI.getWalletTransactions(walletId);
        setWalletTransactions(walletTxResponse.data);
        setWalletTransactionsRaw(walletTxResponse); // Store raw response
      } catch (error) {
        console.log('No wallet transactions found or endpoint not available');
        setWalletTransactions([]);
        setWalletTransactionsRaw({ count: 0, data: [] });
      }

      // Fetch transfers
      const transfersResponse = await bridgeAPI.getTransfers(config.customerId);
      setTransfers(transfersResponse.data);
      setTransfersRaw(transfersResponse); // Store raw response

      // Fetch liquidation history for all liquidation addresses
      const liquidationHistoryPromises = filteredLiquidation.map((la) =>
        bridgeAPI.getLiquidationHistory(la.id).catch(() => ({ count: 0, data: [] }))
      );
      const liquidationHistoryResponses = await Promise.all(liquidationHistoryPromises);
      
      // Combine and sort by date
      const allLiquidationHistory = liquidationHistoryResponses
        .flatMap((response) => response.data)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setLiquidationHistory(allLiquidationHistory);
      // Store combined raw responses
      setLiquidationHistoryRaw({
        count: allLiquidationHistory.length,
        data: allLiquidationHistory,
        responses: liquidationHistoryResponses
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Wallet Overview</h2>
              <div className="space-y-1">
                <p className="text-sm opacity-90">Chain: <span className="font-semibold">{walletChain.toUpperCase()}</span></p>
                <p className="text-xs font-mono opacity-80 break-all">{walletAddress}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Recent Transactions Section */}
            <div>
              <button
                onClick={() => setIsTransactionsCollapsed(!isTransactionsCollapsed)}
                className="w-full flex items-center justify-between mb-3 hover:opacity-80 transition-opacity"
              >
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <span className="mr-2">📊</span>
                  Recent Transactions
                </h3>
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
                <div className="space-y-6">
                  {loading ? (
                    <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        <span className="ml-3 text-gray-600">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Wallet Transaction History Table */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-md font-semibold text-gray-700 flex items-center">
                            <span className="mr-2">💳</span>
                            Wallet Transaction History
                            <span className="ml-2 text-sm font-normal text-gray-600">({walletTransactions.length})</span>
                          </h4>
                          {walletTransactions.length > 0 && (
                            <button
                              onClick={() => openJsonModal('Wallet Transactions - Full Response', walletTransactionsRaw)}
                              className="px-3 py-1.5 bg-gray-800 text-green-400 rounded text-xs font-semibold hover:bg-gray-700 transition-colors"
                              title="View full JSON response"
                            >
                              View Full JSON
                            </button>
                          )}
                        </div>
                        {walletTransactions.length === 0 ? (
                          <p className="text-gray-500 text-sm italic">No wallet transactions found</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border-2 border-gray-200 rounded-lg">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Source</th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Destination</th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Developer Fee</th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Created</th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {walletTransactions.map((tx, idx) => (
                                  <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{tx.amount}</td>
                                    <td className="px-4 py-3 text-sm">
                                      <div className="text-gray-900 font-medium">{tx.source.currency.toUpperCase()}</div>
                                      <div className="text-gray-500 text-xs">{tx.source.payment_rail}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                      <div className="text-gray-900 font-medium">{tx.destination.currency.toUpperCase()}</div>
                                      <div className="text-gray-500 text-xs">{tx.destination.payment_rail}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{tx.developer_fee}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{new Date(tx.created_at).toLocaleString()}</td>
                                    <td className="px-4 py-3">
                                      <button
                                        onClick={() => openJsonModal(`Transaction #${idx + 1}`, tx)}
                                        className="px-2 py-1 bg-gray-800 text-green-400 rounded text-xs font-semibold hover:bg-gray-700 transition-colors"
                                        title="View JSON"
                                      >
                                        JSON
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      {/* Transfer History Table */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-md font-semibold text-gray-700 flex items-center">
                            <span className="mr-2">🔄</span>
                            Transfer History
                            <span className="ml-2 text-sm font-normal text-gray-600">({transfers.length})</span>
                          </h4>
                          {transfers.length > 0 && (
                            <button
                              onClick={() => openJsonModal('Transfers - Full Response', transfersRaw)}
                              className="px-3 py-1.5 bg-gray-800 text-green-400 rounded text-xs font-semibold hover:bg-gray-700 transition-colors"
                              title="View full JSON response"
                            >
                              View Full JSON
                            </button>
                          )}
                        </div>
                        {transfers.length === 0 ? (
                          <p className="text-gray-500 text-sm italic">No transfers found</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border-2 border-gray-200 rounded-lg">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">ID</th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">State</th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Source</th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Destination</th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Fee</th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Created</th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {transfers.map((transfer) => (
                                  <tr key={transfer.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-xs font-mono text-gray-600">{transfer.id.substring(0, 8)}...</td>
                                    <td className="px-4 py-3">
                                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                        transfer.state === 'payment_processed' ? 'bg-green-100 text-green-800' :
                                        transfer.state === 'awaiting_funds' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                                      }`}>
                                        {transfer.state.replace(/_/g, ' ').toUpperCase()}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                      <div className="font-semibold text-gray-900">{transfer.amount} {transfer.currency.toUpperCase()}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                      <div className="text-gray-900 font-medium">{transfer.source.currency.toUpperCase()}</div>
                                      <div className="text-gray-500 text-xs">{transfer.source.payment_rail}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                      <div className="text-gray-900 font-medium">{transfer.destination.currency.toUpperCase()}</div>
                                      <div className="text-gray-500 text-xs">{transfer.destination.payment_rail}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{transfer.developer_fee}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{new Date(transfer.created_at).toLocaleString()}</td>
                                    <td className="px-4 py-3">
                                      <button
                                        onClick={() => openJsonModal(`Transfer ${transfer.id.substring(0, 8)}`, transfer)}
                                        className="px-2 py-1 bg-gray-800 text-green-400 rounded text-xs font-semibold hover:bg-gray-700 transition-colors"
                                        title="View JSON"
                                      >
                                        JSON
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      {/* Liquidation History Table */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-md font-semibold text-gray-700 flex items-center">
                            <span className="mr-2">💧</span>
                            Liquidation Drain History
                            <span className="ml-2 text-sm font-normal text-gray-600">({liquidationHistory.length})</span>
                          </h4>
                          {liquidationHistory.length > 0 && (
                            <button
                              onClick={() => openJsonModal('Liquidation History - Full Response', liquidationHistoryRaw)}
                              className="px-3 py-1.5 bg-gray-800 text-green-400 rounded text-xs font-semibold hover:bg-gray-700 transition-colors"
                              title="View full JSON response"
                            >
                              View Full JSON
                            </button>
                          )}
                        </div>
                        {liquidationHistory.length === 0 ? (
                          <p className="text-gray-500 text-sm italic">No liquidation history found</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border-2 border-gray-200 rounded-lg">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">ID</th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">State</th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Currency</th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Source Rail</th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">From Address</th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Deposit TX</th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Created</th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {liquidationHistory.map((lh) => (
                                  <tr key={lh.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-xs font-mono text-gray-600">{lh.id.substring(0, 8)}...</td>
                                    <td className="px-4 py-3">
                                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                        lh.state === 'payment_processed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                      }`}>
                                        {lh.state.replace(/_/g, ' ').toUpperCase()}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{lh.amount}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{lh.currency.toUpperCase()}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{lh.source_payment_rail}</td>
                                    <td className="px-4 py-3 text-xs font-mono text-gray-600">{lh.from_address.substring(0, 12)}...</td>
                                    <td className="px-4 py-3 text-xs font-mono text-gray-600">{lh.deposit_tx_hash.substring(0, 12)}...</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{new Date(lh.created_at).toLocaleString()}</td>
                                    <td className="px-4 py-3">
                                      <button
                                        onClick={() => openJsonModal(`Liquidation ${lh.id.substring(0, 8)}`, lh)}
                                        className="px-2 py-1 bg-gray-800 text-green-400 rounded text-xs font-semibold hover:bg-gray-700 transition-colors"
                                        title="View JSON"
                                      >
                                        JSON
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Liquidation Addresses Section */}
            <div>
              <button
                onClick={() => setIsLiquidationCollapsed(!isLiquidationCollapsed)}
                className="w-full flex items-center justify-between mb-3 hover:opacity-80 transition-opacity"
              >
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <span className="mr-2">🏦</span>
                  Liquidation Addresses
                  <span className="ml-2 text-sm font-normal text-gray-600">
                    ({liquidationAddresses.length})
                  </span>
                </h3>
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
                <>
                  {loading ? (
                    <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        <span className="ml-3 text-gray-600">Loading...</span>
                      </div>
                    </div>
                  ) : liquidationAddresses.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
                      <p className="text-gray-500 text-center italic">
                        No liquidation addresses found for this wallet
                      </p>
                    </div>
                  ) : (
                <div className="space-y-4">
                  {/* Chain + Currency Breakdown */}
                  <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">Chain + Currency Combinations</h4>
                    <div className="flex flex-wrap gap-2">
                      {getChainCurrencyBreakdown().map(({ combo, count }) => (
                        <span
                          key={combo}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold border border-blue-300"
                        >
                          {combo.toUpperCase()} ({count})
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Liquidation Address Cards */}
                  {liquidationAddresses.map((la) => (
                    <div
                      key={la.id}
                      className="bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-indigo-300 transition-colors"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        {/* ID */}
                        <div>
                          <p className="text-xs text-gray-500 mb-1">ID</p>
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-xs text-gray-900 break-all flex-1">{la.id}</p>
                            <button
                              onClick={() => copyToClipboard(la.id, `la-id-${la.id}`)}
                              className="p-1 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded flex-shrink-0"
                              title="Copy ID"
                            >
                              {copiedField === `la-id-${la.id}` ? (
                                <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Address */}
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Address</p>
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-xs text-gray-900 break-all flex-1">{la.address}</p>
                            <button
                              onClick={() => copyToClipboard(la.address, `la-addr-${la.id}`)}
                              className="p-1 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded flex-shrink-0"
                              title="Copy Address"
                            >
                              {copiedField === `la-addr-${la.id}` ? (
                                <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Chain */}
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Chain</p>
                          <p className="font-semibold text-gray-900 uppercase">{la.chain}</p>
                        </div>

                        {/* Currency */}
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Currency</p>
                          <p className="font-semibold text-gray-900 uppercase">{la.currency}</p>
                        </div>

                        {/* Destination Payment Rail */}
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Destination Payment Rail</p>
                          <p className="font-semibold text-gray-900 uppercase">{la.destination_payment_rail}</p>
                        </div>

                        {/* Destination Currency */}
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Destination Currency</p>
                          <p className="font-semibold text-gray-900 uppercase">{la.destination_currency}</p>
                        </div>

                        {/* Destination Address */}
                        <div className="md:col-span-2">
                          <p className="text-xs text-gray-500 mb-1">Destination Address</p>
                          <p className="font-mono text-xs text-gray-900 break-all">{la.destination_address}</p>
                        </div>

                        {/* State */}
                        <div>
                          <p className="text-xs text-gray-500 mb-1">State</p>
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            la.state === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {la.state.toUpperCase()}
                          </span>
                        </div>

                        {/* Created At */}
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Created At</p>
                          <p className="text-xs text-gray-900">{new Date(la.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Close
          </button>
        </div>
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
