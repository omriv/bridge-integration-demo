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
      ? 'bg-green-100 text-green-800 border-green-300' 
      : 'bg-gray-100 text-gray-600 border-gray-300';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:border-indigo-300 transition-all">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 text-left hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-2">
              <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getStatusColor(virtualAccount.status)}`}>
                {virtualAccount.status.toUpperCase()}
              </span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                {virtualAccount.source_deposit_instructions.currency.toUpperCase()} → {virtualAccount.destination.currency.toUpperCase()}
              </span>
            </div>
            
            <div className="space-y-1.5">
              {/* Virtual Account ID */}
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Virtual Account ID</p>
                <div className="flex items-center gap-1">
                  <p className="font-mono text-xs text-gray-900 break-all flex-1">{virtualAccount.id}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(virtualAccount.id, `va-id-${virtualAccount.id}`);
                    }}
                    className="p-1 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all flex-shrink-0"
                    title="Copy virtual account ID"
                  >
                    {copiedField === `va-id-${virtualAccount.id}` ? (
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

              {/* Destination */}
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Destination Address</p>
                <div className="flex items-center gap-1">
                  <p className="font-mono text-xs text-gray-900 break-all flex-1">{virtualAccount.destination.address}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(virtualAccount.destination.address, `va-dest-${virtualAccount.id}`);
                    }}
                    className="p-1 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all flex-shrink-0"
                    title="Copy destination address"
                  >
                    {copiedField === `va-dest-${virtualAccount.id}` ? (
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
              
              <div className="flex gap-3 text-xs text-gray-600">
                <span>Created: {new Date(virtualAccount.created_at).toLocaleDateString()}</span>
                <span>Fee: {virtualAccount.developer_fee_percent}%</span>
              </div>
            </div>
          </div>
          
          <div className="ml-4">
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
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
            <span className="mr-2">🏦</span>
            Bank Deposit Instructions
          </h4>
          
          <div className="space-y-2">
            <div className="p-2 bg-blue-50 border border-blue-200 rounded">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Currency:</span>
                  <span className="font-semibold text-gray-900">{virtualAccount.source_deposit_instructions.currency.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bank Name:</span>
                  <span className="font-semibold text-gray-900">{virtualAccount.source_deposit_instructions.bank_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bank Address:</span>
                  <span className="font-mono text-xs text-gray-900">{virtualAccount.source_deposit_instructions.bank_address}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-gray-600">Account Number:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono font-semibold text-gray-900">{virtualAccount.source_deposit_instructions.bank_account_number}</span>
                    <button
                      onClick={() => copyToClipboard(virtualAccount.source_deposit_instructions.bank_account_number, `va-account-${virtualAccount.id}`)}
                      className="p-1 hover:bg-white/50 rounded transition-all flex-shrink-0"
                      title="Copy account number"
                    >
                      {copiedField === `va-account-${virtualAccount.id}` ? (
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
                <div className="flex justify-between items-center gap-2">
                  <span className="text-gray-600">Routing Number:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono font-semibold text-gray-900">{virtualAccount.source_deposit_instructions.bank_routing_number}</span>
                    <button
                      onClick={() => copyToClipboard(virtualAccount.source_deposit_instructions.bank_routing_number, `va-routing-${virtualAccount.id}`)}
                      className="p-1 hover:bg-white/50 rounded transition-all flex-shrink-0"
                      title="Copy routing number"
                    >
                      {copiedField === `va-routing-${virtualAccount.id}` ? (
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
                <div className="flex justify-between">
                  <span className="text-gray-600">Beneficiary Name:</span>
                  <span className="font-semibold text-gray-900">{virtualAccount.source_deposit_instructions.bank_beneficiary_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Rails:</span>
                  <span className="font-semibold text-gray-900">{virtualAccount.source_deposit_instructions.payment_rails.join(', ').toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div className="p-2 bg-purple-50 border border-purple-200 rounded">
              <h5 className="text-xs font-semibold text-gray-700 mb-1">Destination Details</h5>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-gray-600">Address:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-xs text-gray-900 truncate max-w-[150px]" title={virtualAccount.destination.address}>
                      {virtualAccount.destination.address}
                    </span>
                    <button
                      onClick={() => copyToClipboard(virtualAccount.destination.address, `va-dest-details-${virtualAccount.id}`)}
                      className="p-1 hover:bg-white/50 rounded transition-all flex-shrink-0"
                      title="Copy destination address"
                    >
                      {copiedField === `va-dest-details-${virtualAccount.id}` ? (
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
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Rail:</span>
                  <span className="font-semibold text-gray-900">{virtualAccount.destination.payment_rail.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Currency:</span>
                  <span className="font-semibold text-gray-900">{virtualAccount.destination.currency.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
