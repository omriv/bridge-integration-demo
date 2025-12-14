import type { Wallet } from '../types';
import { useState } from 'react';
import { useData } from '../context/DataContext';
import { config } from '../config';
import { CreateTransferModal } from './CreateTransferModal';
import { getCurrencyColor } from '../utils/colorUtils';
import { ChainBadge } from './ChainBadge';

interface HorizontalWalletCardProps {
  wallet: Wallet;
}

export function HorizontalWalletCard({ wallet }: HorizontalWalletCardProps) {
  const { customer } = useData();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showCreateTransferModal, setShowCreateTransferModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const copyToClipboard = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Calculate total USD value of all balances
  const calculateTotalUSD = () => {
    return wallet.balances.reduce((total, balance) => {
      const amount = parseFloat(balance.balance);
      const rate = config.conversionRates[balance.currency.toLowerCase()] || 0;
      return total + (amount * rate);
    }, 0);
  };

  const totalUSD = calculateTotalUSD();

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden border border-neutral-200 dark:border-neutral-700">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
            <span className="mr-3 p-1.5 bg-teal-500/10 rounded-lg text-teal-600 dark:text-teal-400"><i className="fas fa-wallet"></i></span>
            Wallet Details
          </h2>
          <svg
            className={`w-5 h-5 text-neutral-500 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {!isCollapsed && (
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/30">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column: Wallet Info */}
            <div className="flex-1 min-w-[300px]">
              <div className="flex items-center gap-2 mb-3">
                {wallet.tags.length > 0 && (
                  <span className="px-2 py-0.5 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded text-sm border border-neutral-300 dark:border-neutral-600">
                    {wallet.tags.join(', ')}
                  </span>
                )}
              </div>
              
              <div className="space-y-3">
                {/* Chain Badge */}
                <div>
                  <ChainBadge chain={wallet.chain} />
                </div>

                {/* Wallet ID */}
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1 font-medium">Wallet ID</p>
                  <div className="flex items-center gap-1 bg-white dark:bg-neutral-900/50 rounded px-2 py-1.5 border border-neutral-200 dark:border-neutral-700/50">
                    <p className="font-mono text-sm text-neutral-700 dark:text-neutral-300 break-all">{wallet.id}</p>
                    <button
                      onClick={() => copyToClipboard(wallet.id, `id-${wallet.id}`)}
                      className="p-1 text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10 rounded transition-all ml-auto"
                      title="Copy wallet ID"
                    >
                      {copiedField === `id-${wallet.id}` ? (
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Wallet Address */}
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1 font-medium">Wallet Address</p>
                  <div className="flex items-center gap-1 bg-white dark:bg-neutral-900/50 rounded px-2 py-1.5 border border-neutral-200 dark:border-neutral-700/50">
                    <p className="font-mono text-sm text-neutral-700 dark:text-neutral-300 break-all">{wallet.address}</p>
                    <button
                      onClick={() => copyToClipboard(wallet.address, `address-${wallet.id}`)}
                      className="p-1 text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10 rounded transition-all ml-auto"
                      title="Copy address"
                    >
                      {copiedField === `address-${wallet.id}` ? (
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="flex gap-4 text-sm text-neutral-500 dark:text-neutral-400 pt-1">
                  <span>Created: {new Date(wallet.created_at).toLocaleDateString()}</span>
                </div>

                {/* Action Buttons */}
                <div className="mt-3 flex gap-3">
                  <button
                    onClick={() => setShowCreateTransferModal(true)}
                    className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-4 py-2 rounded-lg font-semibold hover:bg-amber-500/20 transition-all shadow-lg shadow-amber-900/20 flex items-center gap-2"
                  >
                    <span><i className="fas fa-paper-plane"></i></span> Create Transfer
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Balances */}
            <div className="flex-1 border-t lg:border-t-0 lg:border-l border-neutral-200 dark:border-neutral-700 pt-4 lg:pt-0 lg:pl-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-neutral-700 dark:text-neutral-300 flex items-center">
                  <span className="mr-2"><i className="fas fa-coins"></i></span>
                  Wallet Balances
                </h4>
                <span className="text-lg font-bold text-neutral-900 dark:text-neutral-200">
                  ${totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              
              {wallet.balances.length === 0 ? (
                <p className="text-neutral-500 text-sm italic">No balances available</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {wallet.balances.map((balance, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded border transition-colors ${getCurrencyColor(balance.currency)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm uppercase">
                            {balance.currency}
                          </span>
                          <button
                            onClick={() => copyToClipboard(balance.currency, `currency-${wallet.id}-${index}`)}
                            className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-all"
                            title="Copy currency"
                          >
                            {copiedField === `currency-${wallet.id}-${index}` ? (
                              <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        <span className="text-base font-bold">
                          {parseFloat(balance.balance).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="opacity-75">Chain:</span>
                          <span className="font-mono font-semibold">{balance.chain}</span>
                        </div>
                        {balance.contract_address && (
                          <div className="flex justify-between items-center gap-2">
                            <span className="opacity-75">Contract:</span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-xs truncate max-w-[100px]" title={balance.contract_address}>
                                {balance.contract_address}
                              </span>
                              <button
                                onClick={() => copyToClipboard(balance.contract_address, `contract-${wallet.id}-${index}`)}
                                className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-all flex-shrink-0"
                                title="Copy contract address"
                              >
                                {copiedField === `contract-${wallet.id}-${index}` ? (
                                  <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Transfer Modal */}
      {customer && (
        <CreateTransferModal
          isOpen={showCreateTransferModal}
          onClose={() => setShowCreateTransferModal(false)}
          walletId={wallet.id}
          customerId={customer.id}
          walletAddress={wallet.address}
          walletChain={wallet.chain}
          walletBalances={wallet.balances}
        />
      )}
    </div>
  );
}
