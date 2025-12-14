import type { VirtualAccount } from '../types';
import { useState } from 'react';

interface VirtualAccountCardProps {
  virtualAccount: VirtualAccount;
}

export function VirtualAccountCard({ virtualAccount }: VirtualAccountCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'activated' 
      ? 'bg-green-500/10 text-green-400 border-green-500/30' 
      : 'bg-slate-700 text-slate-400 border-slate-600';
  };

  return (
    <div className="bg-slate-800 rounded-lg shadow-md overflow-hidden border border-slate-700 hover:border-blue-500 transition-all">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 text-left hover:bg-slate-700/50 transition-colors cursor-pointer"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-2">
              <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getStatusColor(virtualAccount.status)}`}>
                {virtualAccount.status.toUpperCase()}
              </span>
              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-xs font-semibold">
                {virtualAccount.source_deposit_instructions.currency.toUpperCase()} → {virtualAccount.destination.currency.toUpperCase()}
              </span>
            </div>
            
            <div className="space-y-1.5">
              {/* Virtual Account ID */}
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Virtual Account ID</p>
                <div className="flex items-center gap-1">
                  <p className="font-mono text-xs text-white break-all flex-1">{virtualAccount.id}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(virtualAccount.id, `va-id-${virtualAccount.id}`);
                    }}
                    className="p-1 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-all flex-shrink-0"
                    title="Copy virtual account ID"
                  >
                    {copiedField === `va-id-${virtualAccount.id}` ? (
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
              </div>

              {/* Destination */}
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Destination Address</p>
                <div className="flex items-center gap-1">
                  <p className="font-mono text-xs text-white break-all flex-1">{virtualAccount.destination.address}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(virtualAccount.destination.address, `va-dest-${virtualAccount.id}`);
                    }}
                    className="p-1 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-all flex-shrink-0"
                    title="Copy destination address"
                  >
                    {copiedField === `va-dest-${virtualAccount.id}` ? (
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
              </div>
              
              <div className="flex gap-3 text-xs text-slate-400">
                <span>Created: {new Date(virtualAccount.created_at).toLocaleDateString()}</span>
                <span>Fee: {virtualAccount.developer_fee_percent}%</span>
              </div>
            </div>
          </div>
          
          <div className="ml-4">
            <svg
              className={`w-5 h-5 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
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
        <div className="border-t border-slate-700 bg-slate-800/50 p-3">
          <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center">
            <span className="mr-2">🏦</span>
            Bank Deposit Instructions
          </h4>
          
          <div className="space-y-2">
            <div className="p-2 bg-blue-500/5 border border-blue-500/20 rounded">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Currency:</span>
                  <span className="font-semibold text-white">{virtualAccount.source_deposit_instructions.currency.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bank Name:</span>
                  <span className="font-semibold text-white">{virtualAccount.source_deposit_instructions.bank_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bank Address:</span>
                  <span className="font-mono text-xs text-white">{virtualAccount.source_deposit_instructions.bank_address}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-400">Account Number:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono font-semibold text-white">{virtualAccount.source_deposit_instructions.bank_account_number}</span>
                    <button
                      onClick={() => copyToClipboard(virtualAccount.source_deposit_instructions.bank_account_number, `va-account-${virtualAccount.id}`)}
                      className="p-1 hover:bg-slate-700 rounded transition-all flex-shrink-0 text-slate-400 hover:text-white"
                      title="Copy account number"
                    >
                      {copiedField === `va-account-${virtualAccount.id}` ? (
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
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-400">Routing Number:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono font-semibold text-white">{virtualAccount.source_deposit_instructions.bank_routing_number}</span>
                    <button
                      onClick={() => copyToClipboard(virtualAccount.source_deposit_instructions.bank_routing_number, `va-routing-${virtualAccount.id}`)}
                      className="p-1 hover:bg-slate-700 rounded transition-all flex-shrink-0 text-slate-400 hover:text-white"
                      title="Copy routing number"
                    >
                      {copiedField === `va-routing-${virtualAccount.id}` ? (
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
                <div className="flex justify-between">
                  <span className="text-slate-400">Beneficiary Name:</span>
                  <span className="font-semibold text-white">{virtualAccount.source_deposit_instructions.bank_beneficiary_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Rails:</span>
                  <span className="font-semibold text-white">{virtualAccount.source_deposit_instructions.payment_rails.join(', ').toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div className="p-2 bg-purple-500/5 border border-purple-500/20 rounded">
              <h5 className="text-xs font-semibold text-slate-300 mb-1">Destination Details</h5>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-400">Address:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-xs text-white truncate max-w-[150px]" title={virtualAccount.destination.address}>
                      {virtualAccount.destination.address}
                    </span>
                    <button
                      onClick={() => copyToClipboard(virtualAccount.destination.address, `va-dest-details-${virtualAccount.id}`)}
                      className="p-1 hover:bg-slate-700 rounded transition-all flex-shrink-0 text-slate-400 hover:text-white"
                      title="Copy destination address"
                    >
                      {copiedField === `va-dest-details-${virtualAccount.id}` ? (
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
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Rail:</span>
                  <span className="font-semibold text-white">{virtualAccount.destination.payment_rail.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Currency:</span>
                  <span className="font-semibold text-white">{virtualAccount.destination.currency.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
