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
      ethereum: 'bg-blue-500 text-white border-blue-600',
      polygon: 'bg-purple-600 text-white border-purple-700',
      base: 'bg-indigo-600 text-white border-indigo-700',
      arbitrum: 'bg-cyan-600 text-white border-cyan-700',
      optimism: 'bg-red-600 text-white border-red-700',
      solana: 'bg-violet-600 text-white border-violet-700',
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 p-4">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Wallet Info */}
        <div className="flex-1 min-w-[300px]">
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2 py-0.5 rounded text-sm font-semibold ${getChainColor(wallet.chain)}`}>
              {wallet.chain.toUpperCase()}
            </span>
            {wallet.tags.length > 0 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-sm">
                {wallet.tags.join(', ')}
              </span>
            )}
          </div>
          
          <div className="space-y-2">
            {/* Wallet ID */}
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Wallet ID</p>
              <div className="flex items-center gap-1">
                <p className="font-mono text-sm text-gray-900 break-all">{wallet.id}</p>
                <button
                  onClick={() => copyToClipboard(wallet.id, `id-${wallet.id}`)}
                  className="p-1 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all"
                  title="Copy wallet ID"
                >
                  {copiedField === `id-${wallet.id}` ? (
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <p className="text-xs text-gray-500 mb-0.5">Wallet Address</p>
              <div className="flex items-center gap-1">
                <p className="font-mono text-sm text-gray-900 break-all">{wallet.address}</p>
                <button
                  onClick={() => copyToClipboard(wallet.address, `address-${wallet.id}`)}
                  className="p-1 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all"
                  title="Copy address"
                >
                  {copiedField === `address-${wallet.id}` ? (
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            
            <div className="flex gap-4 text-sm text-gray-600 pt-1">
              <span>Created: {new Date(wallet.created_at).toLocaleDateString()}</span>
            </div>
            
            {/* Total USD Value */}
            <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg inline-block min-w-[200px]">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-green-700">💵 Total Value</span>
                <span className="text-lg font-bold text-green-900">
                  ${totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-3 flex gap-3">
              <button
                onClick={() => setShowCreateTransferModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-all shadow-sm flex items-center gap-2"
              >
                <span>💸</span> Create Transfer
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Balances */}
        <div className="flex-1 border-t lg:border-t-0 lg:border-l border-gray-200 pt-4 lg:pt-0 lg:pl-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <span className="mr-2">💰</span>
            Wallet Balances
          </h4>
          
          {wallet.balances.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No balances available</p>
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
                          <span className="font-mono text-xs truncate max-w-[100px]" title={balance.contract_address}>
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
      </div>

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
