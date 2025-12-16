import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import type { ExternalAccount } from '../types';

interface GetExternalAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (account: ExternalAccount) => void;
  customerId: string;
}

export function GetExternalAccountModal({
  isOpen,
  onClose,
  onSelectAccount,
  customerId,
}: GetExternalAccountModalProps) {
  const { fetchExternalAccounts } = useData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<ExternalAccount[]>([]);

  useEffect(() => {
    if (isOpen && customerId) {
      loadAccounts();
    }
  }, [isOpen, customerId]);

  const loadAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedAccounts = await fetchExternalAccounts(customerId);
      setAccounts(fetchedAccounts);
    } catch (err) {
      console.error('Error fetching external accounts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch external accounts');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl w-full max-w-2xl relative border border-neutral-200 dark:border-neutral-700">
          {/* Header */}
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center bg-neutral-50 dark:bg-neutral-800/30 rounded-t-xl">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Select External Account</h2>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
                <i className="fas fa-tools mr-1"></i> Work in Progress
              </p>
            </div>
            <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            ) : accounts.length === 0 ? (
              <p className="text-neutral-500 dark:text-neutral-400 text-center py-8">
                No external accounts found for this customer.
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {accounts.map((account) => (
                  <button
                    key={account.id}
                    onClick={() => onSelectAccount(account)}
                    className="w-full text-left p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-neutral-900 dark:text-white">
                        {account.bank_name || 'Unknown Bank'}
                      </span>
                      <span className="text-xs font-bold uppercase bg-neutral-100 dark:bg-neutral-700 px-2 py-0.5 rounded text-neutral-600 dark:text-neutral-300">
                        {account.currency}
                      </span>
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      {account.account_number ? `****${account.account_number.slice(-4)}` : 'No Account Number'}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                        {account.id}
                      </span>
                      <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full">
                        {account.account_type || 'Unknown Type'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-6 border-t border-neutral-200 dark:border-neutral-700 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20 rounded-lg hover:bg-neutral-500/20 font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
