import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { JsonViewerModal } from './JsonViewerModal';
import type { Wallet } from '../types';

interface AddWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  existingWallets: Wallet[];
}

export function AddWalletModal({ isOpen, onClose, customerId, existingWallets }: AddWalletModalProps) {
  const { createWallet } = useData();
  const [chain, setChain] = useState('solana');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPayoneerRules, setIsPayoneerRules] = useState(true);
  
  // Response viewer state
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [responseData, setResponseData] = useState<unknown>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      setError(null);
      setLoading(false);
      setResponseData(null);
      setIsPayoneerRules(true);
      setChain('solana');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isBlocked = isPayoneerRules && existingWallets.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlocked) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = { chain };
      // @ts-ignore - createWallet is not yet in the type definition but will be added
      const result = await createWallet(customerId, payload);
      setResponseData(result);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to create wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRules = () => {
    const newState = !isPayoneerRules;
    setIsPayoneerRules(newState);
    if (newState) {
      setChain('solana');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl w-full max-w-md relative border border-neutral-200 dark:border-neutral-700">
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center bg-neutral-50 dark:bg-neutral-800/30 rounded-t-xl">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Add Bridge Wallet</h2>
            <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6">
            {success ? (
              <div className="text-center py-8">
                <div className="text-green-500 text-5xl mb-4">
                  <i className="fas fa-check-circle"></i>
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Wallet Created Successfully!</h3>
                <p className="text-neutral-500 dark:text-neutral-400 mb-6">The new wallet has been added to the customer's profile.</p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => {
                      setResponseModalOpen(true);
                    }}
                    className="px-4 py-2 bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20 rounded-lg hover:bg-neutral-500/20 font-medium transition-colors"
                  >
                    View Response
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-lg hover:bg-amber-500/20 font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Payoneer Rules Toggle */}
                <div className={`flex items-center justify-between p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 ${
                      isPayoneerRules ? 'bg-rose-500/10' : 'bg-lime-500/10'
                    }`}>
                  <div className="flex flex-col">
                    <span className="font-semibold text-neutral-900 dark:text-white">
                      {isPayoneerRules ? 'Payoneer Rules Apply' : 'Free Choice'}
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {isPayoneerRules ? 'Strict validation enabled' : 'Standard validation'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleRules}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                      isPayoneerRules ? 'bg-rose-500' : 'bg-lime-500'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isPayoneerRules ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {isBlocked && (
                  <div className="bg-yellow-500/10 border-l-4 border-yellow-500/50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700 dark:text-yellow-400">
                          Payoneer Rules: This customer already has a wallet. Creating additional wallets is not allowed.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">Chain *</label>
                  <select
                    value={chain}
                    onChange={(e) => setChain(e.target.value)}
                    disabled={isPayoneerRules}
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-neutral-100 dark:disabled:bg-neutral-800 disabled:text-neutral-500"
                  >
                    {!isPayoneerRules && <option value="base">Base</option>}
                    {!isPayoneerRules && <option value="ethereum">Ethereum</option>}
                    <option value="solana">Solana</option>
                  </select>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    {isPayoneerRules 
                      ? "Only Solana is supported under Payoneer Rules." 
                      : "Select the blockchain network for this wallet."}
                  </p>
                </div>

                <div className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <button
                    type="submit"
                    disabled={loading || isBlocked}
                    className="flex-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-6 py-3 rounded-lg font-semibold hover:bg-amber-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
                        Creating...
                      </>
                    ) : (
                      'Create Wallet'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20 px-6 py-3 rounded-lg font-semibold hover:bg-neutral-500/20 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <JsonViewerModal
        isOpen={responseModalOpen}
        onClose={() => setResponseModalOpen(false)}
        title="API Response"
        data={responseData}
      />
    </div>
  );
}
