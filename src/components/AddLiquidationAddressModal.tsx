import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { JsonViewerModal } from './JsonViewerModal';
import type { Wallet } from '../types';

interface AddLiquidationAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  wallets: Wallet[];
}

export function AddLiquidationAddressModal({ 
  isOpen, 
  onClose, 
  customerId, 
  wallets 
}: AddLiquidationAddressModalProps) {
  const { createLiquidationAddress } = useData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Response viewer state
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [responseData, setResponseData] = useState<unknown>(null);

  const [formData, setFormData] = useState({
    chain: '',
    currency: '',
    destination_payment_rail: '',
    destination_currency: '',
    bridge_wallet_id: '',
    destination_address: '',
    destination_reference: '',
    return_address: '',
    custom_developer_fee_percent: '',
  });

  useEffect(() => {
    if (isOpen) {
      setLoading(false);
      setError(null);
      setSuccess(false);
      setResponseData(null);
      setFormData({
        chain: '',
        currency: '',
        destination_payment_rail: '',
        destination_currency: '',
        bridge_wallet_id: '',
        destination_address: '',
        destination_reference: '',
        return_address: '',
        custom_developer_fee_percent: '',
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Mutual exclusivity logic
      if (name === 'bridge_wallet_id') {
        newData.destination_address = ''; // Clear destination address
        
        // Set payment rail and currency based on wallet
        if (value) {
          const wallet = wallets.find(w => w.id === value);
          if (wallet) {
            newData.destination_payment_rail = wallet.chain;
            
            // Try to find USDC or default to first balance or USDC
            const hasUsdc = wallet.balances?.some(b => b.currency.toLowerCase() === 'usdc');
            if (hasUsdc) {
              newData.destination_currency = 'usdc';
            } else if (wallet.balances && wallet.balances.length > 0) {
              newData.destination_currency = wallet.balances[0].currency;
            } else {
              newData.destination_currency = 'usdc'; // Default
            }
          }
        }
      } else if (name === 'destination_address') {
        newData.bridge_wallet_id = ''; // Clear bridge wallet
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!formData.bridge_wallet_id && !formData.destination_address) {
      setError('Please select a Bridge Wallet or enter a Destination Address.');
      setLoading(false);
      return;
    }

    if (formData.bridge_wallet_id && formData.destination_address) {
      setError('Please select either a Bridge Wallet or a Destination Address, not both.');
      setLoading(false);
      return;
    }

    const removeEmpty = (obj: unknown): unknown => {
      if (obj === null || obj === undefined || obj === '') return undefined;
      
      if (Array.isArray(obj)) {
        const cleaned = obj.map(removeEmpty).filter(v => v !== undefined);
        return cleaned.length > 0 ? cleaned : undefined;
      }
      
      if (typeof obj === 'object') {
        const cleaned: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj)) {
          const cleanedValue = removeEmpty(value);
          if (cleanedValue !== undefined) {
            cleaned[key] = cleanedValue;
          }
        }
        return Object.keys(cleaned).length > 0 ? cleaned : undefined;
      }
      
      return obj;
    };

    try {
      const payload = removeEmpty(formData) as Record<string, unknown>;
      const result = await createLiquidationAddress(customerId, payload);
      setResponseData(result);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to create liquidation address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl relative">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Add Liquidation Address</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6">
            {success ? (
              <div className="text-center py-8">
                <div className="text-green-500 text-5xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Address Created Successfully!</h3>
                <p className="text-gray-600 mb-6">The new liquidation address has been added.</p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => {
                      setResponseModalOpen(true);
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                  >
                    View Response
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Source Chain *</label>
                    <select
                      name="chain"
                      value={formData.chain}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select chain...</option>
                      <option value="arbitrum">Arbitrum</option>
                      <option value="avalanche_c_chain">Avalanche C-Chain</option>
                      <option value="base">Base</option>
                      <option value="ethereum">Ethereum</option>
                      <option value="optimism">Optimism</option>
                      <option value="polygon">Polygon</option>
                      <option value="solana">Solana</option>
                      <option value="stellar">Stellar</option>
                      <option value="tron">Tron</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Source Currency *</label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select currency...</option>
                      <option value="usdb">USDB</option>
                      <option value="usdc">USDC</option>
                      <option value="usdt">USDT</option>
                      <option value="dai">DAI</option>
                      <option value="pyusd">PYUSD</option>
                      <option value="eurc">EURC</option>
                      <option value="any">ANY</option>
                    </select>
                  </div>
                </div>

                {/* Destination Info */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                  <h3 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">Destination Details</h3>
                  
                  {/* Destination Target (Account/Wallet/Address) */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bridge Wallet</label>
                      <select
                        name="bridge_wallet_id"
                        value={formData.bridge_wallet_id}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Select Bridge Wallet...</option>
                        {wallets.map(w => (
                          <option key={w.id} value={w.id}>
                            {w.chain} - {w.address.substring(0, 10)}...
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Rail *</label>
                      <select
                        name="destination_payment_rail"
                        value={formData.destination_payment_rail}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Select chain...</option>
                        <option value="ach">ACH</option>
                        <option value="wire">Wire</option>
                        <option value="sepa">SEPA</option>
                        <option value="swift">SWIFT</option>
                        <option value="spei">SPEI</option>
                        <option value="pix">Pix</option>
                        <option value="ethereum">Ethereum</option>
                        <option value="solana">Solana</option>
                        <option value="polygon">Polygon</option>
                        <option value="arbitrum">Arbitrum</option>
                        <option value="optimism">Optimism</option>
                        <option value="base">Base</option>
                        <option value="avalanche_c_chain">Avalanche</option>
                        <option value="stellar">Stellar</option>
                        <option value="tron">Tron</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Destination Currency *</label>
                      <select
                        name="destination_currency"
                        value={formData.destination_currency}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 uppercase"
                      >
                        <option value="">Select currency...</option>
                        <option value="usd">USD</option>
                        <option value="eur">EUR</option>
                        <option value="mxn">MXN</option>
                        <option value="brl">BRL</option>
                        <option value="usdc">USDC</option>
                        <option value="usdt">USDT</option>
                        <option value="dai">DAI</option>
                        <option value="pyusd">PYUSD</option>
                        <option value="eurc">EURC</option>
                      </select>
                    </div>
                  </div>

                  {/* Destination Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Destination Address (Crypto)</label>
                    <input
                      type="text"
                      name="destination_address"
                      value={formData.destination_address}
                      onChange={handleInputChange}
                      placeholder="0x..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Additional Options */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Additional Options</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Return Address</label>
                      <input
                        type="text"
                        name="return_address"
                        value={formData.return_address}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Developer Fee %</label>
                      <input
                        type="text"
                        name="custom_developer_fee_percent"
                        value={formData.custom_developer_fee_percent}
                        onChange={handleInputChange}
                        placeholder="e.g. 0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating...
                      </>
                    ) : (
                      'Create Address'
                    )}
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
