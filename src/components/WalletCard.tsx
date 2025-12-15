import type { Wallet, VirtualAccount } from '../types';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { config } from '../config';
import { CreateTransferModal } from './CreateTransferModal';
import { getCurrencyColor } from '../utils/colorUtils';
import { ChainBadge } from './ChainBadge';

interface WalletCardProps {
  wallet: Wallet;
  virtualAccounts?: VirtualAccount[];
}

export function WalletCard({ wallet, virtualAccounts = [] }: WalletCardProps) {
  const navigate = useNavigate();
  const { customer } = useData();
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showCreateTransferModal, setShowCreateTransferModal] = useState(false);

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
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm overflow-hidden border border-neutral-200 dark:border-neutral-700 hover:border-amber-500 transition-all">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors cursor-pointer"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-2">
              <ChainBadge chain={wallet.chain} />
              {wallet.tags.length > 0 && (
                <span className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 rounded text-xs">
                  {wallet.tags.join(', ')}
                </span>
              )}
            </div>
            
            <div className="space-y-1.5">
              {/* Wallet ID */}
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">Wallet ID</p>
                <div className="flex items-center gap-1">
                  <p className="font-mono text-xs text-neutral-900 dark:text-white break-all flex-1">{wallet.id}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(wallet.id, `id-${wallet.id}`);
                    }}
                    className="p-1 text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10 rounded transition-all flex-shrink-0"
                    title="Copy wallet ID"
                  >
                    {copiedField === `id-${wallet.id}` ? (
                      <svg className="w-3.5 h-3.5 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

              {/* Wallet Address */}
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">Wallet Address</p>
                <div className="flex items-center gap-1">
                  <p className="font-mono text-xs text-neutral-900 dark:text-white break-all flex-1">{wallet.address}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(wallet.address, `address-${wallet.id}`);
                    }}
                    className="p-1 text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10 rounded transition-all flex-shrink-0"
                    title="Copy address"
                  >
                    {copiedField === `address-${wallet.id}` ? (
                      <svg className="w-3.5 h-3.5 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              
              <div className="flex gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                <span>Created: {new Date(wallet.created_at).toLocaleDateString()}</span>
                <span>Balances: {wallet.balances.length}</span>
              </div>
              
              {/* Total USD Value */}
              <div className="mt-2 p-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    <i className="fas fa-money-bill-wave mr-1"></i> Total Value
                  </span>
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">
                    ${totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              
              {/* Overview Button */}
              <div className="mt-2 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (customer) {
                      navigate(`/${customer.id}/${wallet.id}`, { state: { virtualAccounts } });
                    }
                  }}
                  className="flex-1 bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-teal-500/20 transition-all shadow-sm flex items-center justify-center gap-1"
                >
                  <i className="fas fa-clipboard-list"></i> Overview
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCreateTransferModal(true);
                  }}
                  className="flex-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-amber-500/20 transition-all shadow-sm flex items-center justify-center gap-1"
                >
                  <i className="fas fa-paper-plane"></i> Create Transfer
                </button>
              </div>
            </div>
          </div>
          
          <div className="ml-4">
            <svg
              className={`w-6 h-6 text-neutral-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50 p-3">
          <h4 className="text-sm font-semibold text-neutral-600 dark:text-neutral-300 mb-2 flex items-center">
            <span className="mr-2"><i className="fas fa-coins"></i></span>
            Wallet Balances
          </h4>
          
          {wallet.balances.length === 0 ? (
            <p className="text-neutral-500 text-sm italic">No balances available</p>
          ) : (
            <div className="space-y-2">
              {wallet.balances.map((balance, index) => (
                <div
                  key={index}
                  className={`p-2 rounded border transition-colors ${getCurrencyColor(balance.currency)}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm uppercase">
                        {balance.currency}
                      </span>
                      <button
                        onClick={() => copyToClipboard(balance.currency, `currency-${wallet.id}-${index}`)}
                        className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-all"
                        title="Copy currency"
                      >
                        {copiedField === `currency-${wallet.id}-${index}` ? (
                          <svg className="w-3.5 h-3.5 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                          <span className="font-mono text-xs truncate max-w-[140px]" title={balance.contract_address}>
                            {balance.contract_address}
                          </span>
                          <button
                            onClick={() => copyToClipboard(balance.contract_address, `contract-${wallet.id}-${index}`)}
                            className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-all flex-shrink-0"
                            title="Copy contract address"
                          >
                            {copiedField === `contract-${wallet.id}-${index}` ? (
                              <svg className="w-3 h-3 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
