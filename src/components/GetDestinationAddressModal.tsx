import { useState } from 'react';
import { useData } from '../context/DataContext';
import type { LiquidationAddress } from '../types';

interface GetDestinationAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAddress: (address: LiquidationAddress) => void;
  currentChain: string;
  sourceCurrency: string;
}

export function GetDestinationAddressModal({
  isOpen,
  onClose,
  onSelectAddress,
  currentChain,
  sourceCurrency,
}: GetDestinationAddressModalProps) {
  const { fetchCustomerLiquidationAddresses } = useData();
  const [destinationCustomerId, setDestinationCustomerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<LiquidationAddress[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const handleLoadAddresses = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destinationCustomerId.trim()) {
      setError('Customer ID is required');
      return;
    }

    setLoading(true);
    setError(null);
    setAddresses([]);
    setHasSearched(false);

    try {
      // Fetch addresses with a reasonable limit, e.g., 100 to get a good chance of finding matches
      // In a real app, we might need pagination, but for this demo, fetching a batch is likely sufficient
      const addresses = await fetchCustomerLiquidationAddresses(destinationCustomerId, 100);
      
      const filteredAddresses = addresses.filter(addr => {
        const chainMatch = addr.chain === currentChain;
        const currencyMatch = addr.currency === 'any' || addr.currency.toLowerCase() === sourceCurrency.toLowerCase();
        return chainMatch && currencyMatch;
      });

      setAddresses(filteredAddresses);
      setHasSearched(true);
    } catch (err) {
      console.error('Error fetching addresses:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch addresses');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl w-full max-w-2xl relative border border-neutral-200 dark:border-neutral-700">
          {/* Header */}
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center bg-neutral-50 dark:bg-neutral-800/30 rounded-t-xl">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Get Destination Customer Addresses</h2>
            <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6">
            <form onSubmit={handleLoadAddresses} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                  Destination Customer ID <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={destinationCustomerId}
                    onChange={(e) => setDestinationCustomerId(e.target.value)}
                    placeholder="Enter Customer ID (GUID)"
                    className="flex-1 px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 placeholder-neutral-400 dark:placeholder-neutral-500"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {loading ? 'Loading...' : 'Load Addresses'}
                  </button>
                </div>
              </div>
            </form>

            {error && (
              <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {hasSearched && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                  Available Addresses ({addresses.length})
                </h3>
                
                {addresses.length === 0 ? (
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm italic">
                    No matching addresses found for chain {currentChain} and currency {sourceCurrency} (or 'any').
                  </p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {addresses.map((addr) => (
                      <button
                        key={addr.id}
                        onClick={() => onSelectAddress(addr)}
                        className="w-full text-left p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-mono text-xs text-neutral-500 dark:text-neutral-400">{addr.id}</span>
                          <span className="text-xs font-bold uppercase bg-neutral-100 dark:bg-neutral-700 px-2 py-0.5 rounded text-neutral-600 dark:text-neutral-300">
                            {addr.currency}
                          </span>
                        </div>
                        <div className="font-mono text-sm text-neutral-900 dark:text-white break-all group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {addr.address}
                        </div>
                        <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                          Chain: {addr.chain}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
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
