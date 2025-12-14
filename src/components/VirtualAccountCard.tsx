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
      ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30' 
      : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400 border-neutral-200 dark:border-neutral-600';
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm overflow-hidden border border-neutral-200 dark:border-neutral-700 hover:border-amber-500 transition-all">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors cursor-pointer"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-2">
              <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getStatusColor(virtualAccount.status)}`}>
                {virtualAccount.status.toUpperCase()}
              </span>
              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded text-xs font-semibold">
                {virtualAccount.source_deposit_instructions.currency.toUpperCase()} → {virtualAccount.destination.currency.toUpperCase()}
              </span>
            </div>
            
            <div className="space-y-1.5">
              {/* Virtual Account ID */}
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">Virtual Account ID</p>
                <div className="flex items-center gap-1">
                  <p className="font-mono text-xs text-neutral-900 dark:text-white break-all flex-1">{virtualAccount.id}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(virtualAccount.id, `va-id-${virtualAccount.id}`);
                    }}
                    className="p-1 text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10 rounded transition-all flex-shrink-0"
                    title="Copy virtual account ID"
                  >
                    {copiedField === `va-id-${virtualAccount.id}` ? (
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

              {/* Destination */}
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">Destination Address</p>
                <div className="flex items-center gap-1">
                  <p className="font-mono text-xs text-neutral-900 dark:text-white break-all flex-1">{virtualAccount.destination.address}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(virtualAccount.destination.address, `va-dest-${virtualAccount.id}`);
                    }}
                    className="p-1 text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10 rounded transition-all flex-shrink-0"
                    title="Copy destination address"
                  >
                    {copiedField === `va-dest-${virtualAccount.id}` ? (
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
              
              <div className="flex gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                <span>Created: {new Date(virtualAccount.created_at).toLocaleDateString()}</span>
                <span>Fee: {virtualAccount.developer_fee_percent}%</span>
              </div>
            </div>
          </div>
          
          <div className="ml-4">
            <svg
              className={`w-5 h-5 text-neutral-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
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
            <span className="mr-2"><i className="fas fa-university"></i></span>
            Bank Deposit Instructions
          </h4>
          
          <div className="space-y-2">
            <div className="p-2 bg-amber-500/5 border border-amber-500/20 rounded">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">Currency:</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">{virtualAccount.source_deposit_instructions.currency.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">Bank Name:</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">{virtualAccount.source_deposit_instructions.bank_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">Bank Address:</span>
                  <span className="font-mono text-xs text-neutral-900 dark:text-white">{virtualAccount.source_deposit_instructions.bank_address}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-neutral-500 dark:text-neutral-400">Account Number:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono font-semibold text-neutral-900 dark:text-white">{virtualAccount.source_deposit_instructions.bank_account_number}</span>
                    <button
                      onClick={() => copyToClipboard(virtualAccount.source_deposit_instructions.bank_account_number, `va-account-${virtualAccount.id}`)}
                      className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-all flex-shrink-0 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                      title="Copy account number"
                    >
                      {copiedField === `va-account-${virtualAccount.id}` ? (
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
                <div className="flex justify-between items-center gap-2">
                  <span className="text-neutral-500 dark:text-neutral-400">Routing Number:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono font-semibold text-neutral-900 dark:text-white">{virtualAccount.source_deposit_instructions.bank_routing_number}</span>
                    <button
                      onClick={() => copyToClipboard(virtualAccount.source_deposit_instructions.bank_routing_number, `va-routing-${virtualAccount.id}`)}
                      className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-all flex-shrink-0 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                      title="Copy routing number"
                    >
                      {copiedField === `va-routing-${virtualAccount.id}` ? (
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
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">Beneficiary Name:</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">{virtualAccount.source_deposit_instructions.bank_beneficiary_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">Payment Rails:</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">{virtualAccount.source_deposit_instructions.payment_rails.join(', ').toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div className="p-2 bg-teal-500/5 border border-teal-500/20 rounded">
              <h5 className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-1">Destination Details</h5>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-neutral-500 dark:text-neutral-400">Address:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-xs text-neutral-900 dark:text-white truncate max-w-[150px]" title={virtualAccount.destination.address}>
                      {virtualAccount.destination.address}
                    </span>
                    <button
                      onClick={() => copyToClipboard(virtualAccount.destination.address, `va-dest-details-${virtualAccount.id}`)}
                      className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-all flex-shrink-0 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                      title="Copy destination address"
                    >
                      {copiedField === `va-dest-details-${virtualAccount.id}` ? (
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
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">Payment Rail:</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">{virtualAccount.destination.payment_rail.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">Currency:</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">{virtualAccount.destination.currency.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
