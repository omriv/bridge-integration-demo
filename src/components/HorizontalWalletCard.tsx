import type { Wallet, VirtualAccount } from '../types';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { config } from '../config';
import { CreateTransferModal } from './CreateTransferModal';

interface HorizontalWalletCardProps {
  wallet: Wallet;
  virtualAccounts?: VirtualAccount[];
}

export function HorizontalWalletCard({ wallet, virtualAccounts = [] }: HorizontalWalletCardProps) {
  const navigate = useNavigate();
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

  const getChainColor = (chain: string) => {
    const colors: Record<string, string> = {
      ethereum: 'bg-blue-500/20 text-blue-200 border-blue-500/30',
      polygon: 'bg-purple-500/20 text-purple-200 border-purple-500/30',
      base: 'bg-indigo-500/20 text-indigo-200 border-indigo-500/30',
      arbitrum: 'bg-cyan-500/20 text-cyan-200 border-cyan-500/30',
      optimism: 'bg-red-500/20 text-red-200 border-red-500/30',
      solana: 'bg-violet-500/20 text-violet-200 border-violet-500/30',
      avalanche: 'bg-rose-500/20 text-rose-200 border-rose-500/30',
      bsc: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30',
    };
    return colors[chain.toLowerCase()] || 'bg-slate-600 text-white border-slate-700';
  };

  const getCurrencyColor = (currency: string) => {
    const colors: Record<string, string> = {
      usdc: 'bg-blue-500/10 border-blue-500/20 text-blue-200',
      usdt: 'bg-green-500/10 border-green-500/20 text-green-200',
      usdb: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-200',
      dai: 'bg-amber-500/10 border-amber-500/20 text-amber-200',
      eth: 'bg-slate-500/10 border-slate-500/20 text-slate-200',
      weth: 'bg-slate-500/10 border-slate-500/20 text-slate-200',
      btc: 'bg-orange-500/10 border-orange-500/20 text-orange-200',
      wbtc: 'bg-orange-500/10 border-orange-500/20 text-orange-200',
      matic: 'bg-purple-500/10 border-purple-500/20 text-purple-200',
      sol: 'bg-violet-500/10 border-violet-500/20 text-violet-200',
      avax: 'bg-rose-500/10 border-rose-500/20 text-rose-200',
      bnb: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-200',
    };
    return colors[currency.toLowerCase()] || 'bg-slate-700/30 border-slate-600 text-slate-200';
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
    <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-700">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-white flex items-center">
            <span className="mr-3 p-1.5 bg-blue-500/10 rounded-lg text-blue-400">💼</span>
            Wallet Details
          </h2>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getChainColor(wallet.chain)}`}>
              {wallet.chain.toUpperCase()}
            </span>
            <span className="font-mono text-xs text-slate-400 bg-slate-900/50 px-2 py-0.5 rounded border border-slate-700/50">
              {wallet.address.substring(0, 8)}...{wallet.address.substring(wallet.address.length - 6)}
            </span>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-slate-500 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {!isCollapsed && (
        <div className="p-4 border-t border-slate-700 bg-slate-900/30">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column: Wallet Info */}
            <div className="flex-1 min-w-[300px]">
              <div className="flex items-center gap-2 mb-3">
                {wallet.tags.length > 0 && (
                  <span className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-sm border border-slate-600">
                    {wallet.tags.join(', ')}
                  </span>
                )}
              </div>
              
              <div className="space-y-3">
                {/* Wallet ID */}
                <div>
                  <p className="text-xs text-slate-500 mb-1 font-medium">Wallet ID</p>
                  <div className="flex items-center gap-1 bg-slate-900/50 rounded px-2 py-1.5 border border-slate-700/50">
                    <p className="font-mono text-sm text-slate-300 break-all">{wallet.id}</p>
                    <button
                      onClick={() => copyToClipboard(wallet.id, `id-${wallet.id}`)}
                      className="p-1 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-all ml-auto"
                      title="Copy wallet ID"
                    >
                      {copiedField === `id-${wallet.id}` ? (
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <p className="text-xs text-slate-500 mb-1 font-medium">Wallet Address</p>
                  <div className="flex items-center gap-1 bg-slate-900/50 rounded px-2 py-1.5 border border-slate-700/50">
                    <p className="font-mono text-sm text-slate-300 break-all">{wallet.address}</p>
                    <button
                      onClick={() => copyToClipboard(wallet.address, `address-${wallet.id}`)}
                      className="p-1 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-all ml-auto"
                      title="Copy address"
                    >
                      {copiedField === `address-${wallet.id}` ? (
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                
                <div className="flex gap-4 text-sm text-slate-400 pt-1">
                  <span>Created: {new Date(wallet.created_at).toLocaleDateString()}</span>
                </div>
                
                {/* Total USD Value */}
                <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg inline-block min-w-[200px]">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-green-400">💵 Total Value</span>
                    <span className="text-lg font-bold text-green-200">
                      ${totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-3 flex gap-3">
                  <button
                    onClick={() => setShowCreateTransferModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-500 transition-all shadow-lg shadow-green-900/20 flex items-center gap-2"
                  >
                    <span>💸</span> Create Transfer
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Balances */}
            <div className="flex-1 border-t lg:border-t-0 lg:border-l border-slate-700 pt-4 lg:pt-0 lg:pl-6">
              <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center">
                <span className="mr-2">💰</span>
                Wallet Balances
              </h4>
              
              {wallet.balances.length === 0 ? (
                <p className="text-slate-500 text-sm italic">No balances available</p>
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
                            className="p-1 hover:bg-slate-900/30 rounded transition-all"
                            title="Copy currency"
                          >
                            {copiedField === `currency-${wallet.id}-${index}` ? (
                              <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                className="p-1 hover:bg-slate-900/30 rounded transition-all flex-shrink-0"
                                title="Copy contract address"
                              >
                                {copiedField === `contract-${wallet.id}-${index}` ? (
                                  <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
