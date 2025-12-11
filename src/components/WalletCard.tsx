import type { Wallet, VirtualAccount } from '../types';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { config } from '../config';
import { CreateTransferModal } from './CreateTransferModal';

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

  const getChainColor = (chain: string) => {
    const colors: Record<string, string> = {
      ethereum: 'bg-teal-500 text-white border-blue-600',
      polygon: 'bg-purple-600 text-white border-purple-700',
      base: 'bg-amber-600 text-white border-indigo-700',
      arbitrum: 'bg-cyan-600 text-white border-cyan-700',
      optimism: 'bg-red-600 text-white border-red-700',
      solana: 'bg-fuchsia-600 text-white border-violet-700',
      avalanche: 'bg-rose-600 text-white border-rose-700',
      bsc: 'bg-yellow-600 text-white border-yellow-700',
    };
    return colors[chain.toLowerCase()] || 'bg-gray-600 text-white border-gray-700';
  };

  const getCurrencyColor = (currency: string) => {
    const colors: Record<string, string> = {
      usdc: 'bg-blue-50 border-blue-200 text-blue-900',
      usdt: 'bg-green-50 border-green-200 text-green-900',
      usdb: 'bg-indigo-50 border-indigo-200 text-indigo-900',
      dai: 'bg-amber-50 border-amber-200 text-amber-900',
      eth: 'bg-slate-50 border-slate-200 text-slate-900',
      weth: 'bg-slate-50 border-slate-200 text-slate-900',
      btc: 'bg-orange-50 border-orange-200 text-orange-900',
      wbtc: 'bg-orange-50 border-orange-200 text-orange-900',
      matic: 'bg-purple-50 border-purple-200 text-purple-900',
      sol: 'bg-violet-50 border-violet-200 text-violet-900',
      avax: 'bg-rose-50 border-rose-200 text-rose-900',
      bnb: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    };
    return colors[currency.toLowerCase()] || 'bg-gray-50 border-gray-200 text-gray-900';
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:border-indigo-300 transition-all">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 text-left hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-2">
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getChainColor(wallet.chain)}`}>
                {wallet.chain.toUpperCase()}
              </span>
              {wallet.tags.length > 0 && (
                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                  {wallet.tags.join(', ')}
                </span>
              )}
            </div>
            
            <div className="space-y-1.5">
              {/* Wallet ID */}
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Wallet ID</p>
                <div className="flex items-center gap-1">
                  <p className="font-mono text-xs text-gray-900 break-all flex-1">{wallet.id}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(wallet.id, `id-${wallet.id}`);
                    }}
                    className="p-1 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all flex-shrink-0"
                    title="Copy wallet ID"
                  >
                    {copiedField === `id-${wallet.id}` ? (
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

              {/* Wallet Address */}
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Wallet Address</p>
                <div className="flex items-center gap-1">
                  <p className="font-mono text-xs text-gray-900 break-all flex-1">{wallet.address}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(wallet.address, `address-${wallet.id}`);
                    }}
                    className="p-1 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all flex-shrink-0"
                    title="Copy address"
                  >
                    {copiedField === `address-${wallet.id}` ? (
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
              
              <div className="flex gap-4 text-xs text-gray-600">
                <span>Created: {new Date(wallet.created_at).toLocaleDateString()}</span>
                <span>Balances: {wallet.balances.length}</span>
              </div>
              
              {/* Total USD Value */}
              <div className="mt-2 p-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-green-700">💵 Total Value</span>
                  <span className="text-sm font-bold text-green-900">
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
                  className="flex-1 bg-indigo-500 text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-indigo-700 transition-all shadow-sm"
                >
                  📋 Overview
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCreateTransferModal(true);
                  }}
                  className="flex-1 bg-green-500 text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-green-700 transition-all shadow-sm"
                >
                  💸 Create Transfer
                </button>
              </div>
            </div>
          </div>
          
          <div className="ml-4">
            <svg
              className={`w-6 h-6 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
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
        <div className="border-t border-gray-100 bg-gradient-to-br from-gray-50 to-white p-3">
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <span className="mr-2">💰</span>
            Wallet Balances
          </h4>
          
          {wallet.balances.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No balances available</p>
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
                        className="p-1 hover:bg-white/50 rounded transition-all"
                        title="Copy currency"
                      >
                        {copiedField === `currency-${wallet.id}-${index}` ? (
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
                            className="p-1 hover:bg-white/50 rounded transition-all flex-shrink-0"
                            title="Copy contract address"
                          >
                            {copiedField === `contract-${wallet.id}-${index}` ? (
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
