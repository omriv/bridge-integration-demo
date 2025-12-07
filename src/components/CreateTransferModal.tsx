import { useState, useEffect } from 'react';
import { JsonViewerModal } from './JsonViewerModal';
import type { WalletBalance } from '../types';
import { getAvailableRoutes, getDestinationRails, getDestinationCurrencies, railToApiFormat, type Route } from '../utils/routingHelper';
import { bridgeAPI } from '../services/bridgeAPI';

interface CreateTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletId: string;
  customerId: string;
  walletAddress: string;
  walletChain: string;
  walletBalances: WalletBalance[];
}

export function CreateTransferModal({
  isOpen,
  onClose,
  walletId,
  customerId,
  walletAddress,
  walletChain,
  walletBalances,
}: CreateTransferModalProps) {
  // Get currencies with balance > 0
  const availableCurrencies = walletBalances
    .filter(balance => parseFloat(balance.balance) > 0)
    .map(balance => balance.currency);
  
  // Default to first available currency or 'usd'
  const defaultCurrency = availableCurrencies.length > 0 ? availableCurrencies[0] : 'usd';
  const [formData, setFormData] = useState({
    amount: '',
    source_currency: defaultCurrency,
    source_payment_rail: walletChain,
    source_external_account_id: '',
    source_from_address: walletAddress,
    destination_currency: 'usdc',
    destination_payment_rail: walletChain,
    destination_external_account_id: '',
    destination_bridge_wallet_id: '',
    destination_to_address: walletAddress,
    destination_wire_message: '',
    destination_sepa_reference: '',
    destination_swift_reference: '',
    destination_spei_reference: '',
    destination_reference: '',
    destination_swift_charges: 'our',
    destination_ach_reference: '',
    destination_blockchain_memo: '',
    client_reference_id: '',
    developer_fee: '',
    developer_fee_percent: '',
    dry_run: false,
    flexible_amount: false,
    static_template: false,
    allow_any_from_address: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [responseData, setResponseData] = useState<Record<string, unknown> | null>(null);
  const [showJsonModal, setShowJsonModal] = useState(false);
  
  // Routing state
  const [availableRoutes, setAvailableRoutes] = useState<Route[]>([]);
  const [destinationRails, setDestinationRails] = useState<string[]>([]);
  const [destinationCurrencies, setDestinationCurrencies] = useState<string[]>([]);

  // Fetch available routes when source changes
  useEffect(() => {
    const fetchRoutes = async () => {
      const routes = await getAvailableRoutes(walletChain, formData.source_currency);
      setAvailableRoutes(routes);
      
      // Get distinct destination rails
      const rails = getDestinationRails(routes);
      setDestinationRails(rails);
      
      // Set default destination rail if available
      if (rails.length > 0) {
        const defaultRail = rails[0];
        const currencies = getDestinationCurrencies(routes, defaultRail);
        setDestinationCurrencies(currencies);
        
        setFormData(prev => ({
          ...prev,
          destination_payment_rail: railToApiFormat(defaultRail),
          destination_currency: currencies.length > 0 ? currencies[0].toLowerCase() : prev.destination_currency
        }));
      }
    };
    
    if (isOpen && walletChain && formData.source_currency) {
      fetchRoutes();
    }
  }, [walletChain, formData.source_currency, isOpen]);
  
  // Update destination currencies when destination rail changes
  useEffect(() => {
    if (availableRoutes.length > 0 && formData.destination_payment_rail) {
      const currencies = getDestinationCurrencies(availableRoutes, formData.destination_payment_rail);
      setDestinationCurrencies(currencies);
      
      // Set first currency as default if current one is not available
      if (currencies.length > 0 && !currencies.includes(formData.destination_currency.toUpperCase())) {
        setFormData(prev => ({
          ...prev,
          destination_currency: currencies[0].toLowerCase()
        }));
      }
    }
  }, [formData.destination_payment_rail, availableRoutes]);

  if (!isOpen) return null;
  
  // Get current balance for selected currency
  const selectedBalance = walletBalances.find(
    balance => balance.currency.toLowerCase() === formData.source_currency.toLowerCase()
  );
  const availableBalance = selectedBalance ? parseFloat(selectedBalance.balance) : 0;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields based on API docs
    if (!formData.amount && !formData.flexible_amount) {
      newErrors.amount = 'Amount is required unless using flexible amount';
    }

    // Amount validation
    if (formData.amount && !/^\d+(\.\d+)?$/.test(formData.amount)) {
      newErrors.amount = 'Amount must be a valid decimal number';
    }

    // Developer fee validation
    if (formData.developer_fee && !/^\d+(\.\d+)?$/.test(formData.developer_fee)) {
      newErrors.developer_fee = 'Developer fee must be a valid decimal number';
    }

    // Developer fee percent validation
    if (formData.developer_fee_percent) {
      const percent = parseFloat(formData.developer_fee_percent);
      if (isNaN(percent) || percent < 0 || percent > 100) {
        newErrors.developer_fee_percent = 'Developer fee percent must be between 0.0 and 100.0';
      }
    }

    // Flexible amount requires developer_fee_percent, not developer_fee
    if (formData.flexible_amount && formData.developer_fee) {
      newErrors.developer_fee = 'Flexible amount requires developer_fee_percent instead of developer_fee';
    }

    // Client reference ID length validation
    if (formData.client_reference_id && (formData.client_reference_id.length < 1 || formData.client_reference_id.length > 256)) {
      newErrors.client_reference_id = 'Client reference ID must be between 1 and 256 characters';
    }

    // Source validation
    if (formData.source_payment_rail === 'ethereum' || formData.source_payment_rail === 'polygon' || formData.source_payment_rail === 'base') {
      if (!formData.source_from_address && !formData.allow_any_from_address) {
        newErrors.source_from_address = 'From address is required for crypto sources (or enable allow_any_from_address)';
      }
    }

    // Destination validation
    if (formData.destination_payment_rail === 'ethereum' || formData.destination_payment_rail === 'polygon' || formData.destination_payment_rail === 'base') {
      if (!formData.destination_to_address && !formData.destination_bridge_wallet_id) {
        newErrors.destination_to_address = 'To address is required for crypto destinations';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    setResponseData(null);

    try {
      // Build source object
      const source: Record<string, unknown> = {
        currency: formData.source_currency,
        payment_rail: formData.source_payment_rail,
      };

      if (formData.source_external_account_id) source.external_account_id = formData.source_external_account_id;
      if (formData.source_from_address) source.from_address = formData.source_from_address;

      // Build destination object
      const destination: Record<string, unknown> = {
        currency: formData.destination_currency,
        payment_rail: formData.destination_payment_rail,
      };

      if (formData.destination_external_account_id) destination.external_account_id = formData.destination_external_account_id;
      if (formData.destination_bridge_wallet_id) destination.bridge_wallet_id = formData.destination_bridge_wallet_id;
      if (formData.destination_to_address) destination.to_address = formData.destination_to_address;
      
      // Payment rail specific fields
      if (formData.destination_payment_rail === 'wire' && formData.destination_wire_message) {
        destination.wire_message = formData.destination_wire_message;
      }
      if (formData.destination_payment_rail === 'sepa' && formData.destination_sepa_reference) {
        destination.sepa_reference = formData.destination_sepa_reference;
      }
      if (formData.destination_payment_rail === 'swift') {
        if (formData.destination_swift_reference) destination.swift_reference = formData.destination_swift_reference;
        if (formData.destination_swift_charges) destination.swift_charges = formData.destination_swift_charges;
      }
      if (formData.destination_payment_rail === 'spei' && formData.destination_spei_reference) {
        destination.spei_reference = formData.destination_spei_reference;
      }
      if (formData.destination_payment_rail === 'ach' && formData.destination_ach_reference) {
        destination.ach_reference = formData.destination_ach_reference;
      }
      
      // Blockchain-specific fields
      const blockchainRails = ['ethereum', 'polygon', 'base', 'arbitrum', 'optimism', 'avalanche_c_chain', 'solana', 'stellar', 'tron', 'bitcoin'];
      if (blockchainRails.includes(formData.destination_payment_rail) && formData.destination_blockchain_memo) {
        destination.blockchain_memo = formData.destination_blockchain_memo;
      }
      
      // Generic reference field
      if (formData.destination_reference) destination.reference = formData.destination_reference;

      // Build request body
      const requestBody: Record<string, unknown> = {
        on_behalf_of: customerId,
        source,
        destination,
      };

      if (formData.amount) requestBody.amount = formData.amount;
      if (formData.client_reference_id) requestBody.client_reference_id = formData.client_reference_id;
      if (formData.developer_fee) requestBody.developer_fee = formData.developer_fee;
      if (formData.developer_fee_percent) requestBody.developer_fee_percent = formData.developer_fee_percent;
      if (formData.dry_run) requestBody.dry_run = formData.dry_run;

      // Build features object
      const features: Record<string, boolean> = {};
      if (formData.flexible_amount) features.flexible_amount = true;
      if (formData.static_template) features.static_template = true;
      if (formData.allow_any_from_address) features.allow_any_from_address = true;
      if (Object.keys(features).length > 0) requestBody.features = features;

      const data = await bridgeAPI.createTransfer(requestBody);
      setResponseData(data as Record<string, unknown>);

      if (data) {
        setSuccessMessage('Transfer created successfully!');
        setErrorMessage('');
      }
    } catch (error) {
      console.error('Error creating transfer:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      try {
        const errorObj = JSON.parse(errorMessage);
        setErrorMessage(`Transfer failed: ${JSON.stringify(errorObj)}`);
      } catch {
        setErrorMessage(`Error: ${errorMessage}`);
      }
      setSuccessMessage('');
      setResponseData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Create Transfer</h2>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <p className="text-sm opacity-90 mt-1">Customer: {customerId} • Wallet: {walletId}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="space-y-6">
              {/* Amount Section */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Transfer Amount</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount
                    </label>
                    <input
                      type="text"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      disabled={formData.flexible_amount}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.amount ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="10.50"
                    />
                    {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                    {availableBalance > 0 && (
                      <p className="text-sm text-gray-600 mt-1">
                        💰 Available: {availableBalance.toLocaleString()} {formData.source_currency.toUpperCase()}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Reference ID
                    </label>
                    <input
                      type="text"
                      name="client_reference_id"
                      value={formData.client_reference_id}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.client_reference_id ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Optional (1-256 chars)"
                    />
                    {errors.client_reference_id && <p className="text-red-500 text-xs mt-1">{errors.client_reference_id}</p>}
                  </div>
                </div>
              </div>

              {/* Source Section */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Source</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Rail <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={walletChain.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                      title="Payment rail is fixed to the wallet's chain"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="source_currency"
                      value={formData.source_currency}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 max-h-40 overflow-y-auto"
                      size={1}
                      disabled={availableCurrencies.length === 0}
                    >
                      {availableCurrencies.length > 0 ? (
                        availableCurrencies.map((currency) => (
                          <option key={currency} value={currency}>
                            {currency.toUpperCase()}
                          </option>
                        ))
                      ) : (
                        <option value="">No currencies with balance {'>'} 0</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      External Account ID
                    </label>
                    <input
                      type="text"
                      name="source_external_account_id"
                      value={formData.source_external_account_id}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      From Address
                    </label>
                    <input
                      type="text"
                      value={walletAddress}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed font-mono text-sm"
                      title="Pre-populated with selected wallet address"
                    />
                  </div>
                </div>
              </div>

              {/* Destination Section */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Destination</h3>
                {destinationRails.length === 0 && (
                  <p className="text-sm text-amber-600 mb-3 p-2 bg-amber-50 border border-amber-200 rounded">
                    ⚠️ No available routes found for {walletChain.toUpperCase()} {formData.source_currency.toUpperCase()}
                  </p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Rail <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="destination_payment_rail"
                      value={formData.destination_payment_rail}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 max-h-40 overflow-y-auto"
                      size={1}
                      disabled={destinationRails.length === 0}
                    >
                      {destinationRails.length > 0 ? (
                        destinationRails.map((rail) => (
                          <option key={rail} value={railToApiFormat(rail)}>
                            {rail}
                          </option>
                        ))
                      ) : (
                        <option value="">No available routes</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="destination_currency"
                      value={formData.destination_currency}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 max-h-40 overflow-y-auto"
                      size={1}
                      disabled={destinationCurrencies.length === 0}
                    >
                      {destinationCurrencies.length > 0 ? (
                        destinationCurrencies.map((currency) => (
                          <option key={currency} value={currency.toLowerCase()}>
                            {currency}
                          </option>
                        ))
                      ) : (
                        <option value="">Select a payment rail first</option>
                      )}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      To Address (for crypto destinations) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="destination_to_address"
                      value={formData.destination_to_address}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.destination_to_address ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder={walletAddress}
                    />
                    {errors.destination_to_address && <p className="text-red-500 text-xs mt-1">{errors.destination_to_address}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bridge Wallet ID
                    </label>
                    <input
                      type="text"
                      name="destination_bridge_wallet_id"
                      value={formData.destination_bridge_wallet_id}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      External Account ID
                    </label>
                    <input
                      type="text"
                      name="destination_external_account_id"
                      value={formData.destination_external_account_id}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Wire Message
                    </label>
                    <input
                      type="text"
                      name="destination_wire_message"
                      value={formData.destination_wire_message}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Blockchain Memo
                    </label>
                    <input
                      type="text"
                      name="destination_blockchain_memo"
                      value={formData.destination_blockchain_memo}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Developer Fee Section */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Developer Fee</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fixed Fee (amount)
                    </label>
                    <input
                      type="text"
                      name="developer_fee"
                      value={formData.developer_fee}
                      onChange={handleChange}
                      disabled={formData.flexible_amount}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.developer_fee ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="0.50"
                    />
                    {errors.developer_fee && <p className="text-red-500 text-xs mt-1">{errors.developer_fee}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Percentage Fee (0.0-100.0)
                    </label>
                    <input
                      type="text"
                      name="developer_fee_percent"
                      value={formData.developer_fee_percent}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.developer_fee_percent ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="1.0"
                    />
                    {errors.developer_fee_percent && <p className="text-red-500 text-xs mt-1">{errors.developer_fee_percent}</p>}
                  </div>
                </div>
              </div>

              {/* Features Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Features & Options</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="flexible_amount"
                      checked={formData.flexible_amount}
                      onChange={handleChange}
                      className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Flexible Amount (matches any amount deposited)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="allow_any_from_address"
                      checked={formData.allow_any_from_address}
                      onChange={handleChange}
                      className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Allow Any From Address (recommended for crypto deposits)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="static_template"
                      checked={formData.static_template}
                      onChange={handleChange}
                      className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Static Template</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="dry_run"
                      checked={formData.dry_run}
                      onChange={handleChange}
                      className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Dry Run (validate without creating)</span>
                  </label>
                </div>
              </div>

              {/* Messages */}
              {successMessage && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <p className="text-green-800 font-semibold">{successMessage}</p>
                </div>
              )}
              {errorMessage && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <p className="text-red-800 font-semibold">{errorMessage}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Send Transfer'}
                </button>
                {responseData && (
                  <button
                    type="button"
                    onClick={() => setShowJsonModal(true)}
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                  >
                    View JSON
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* JSON Viewer Modal */}
      <JsonViewerModal
        isOpen={showJsonModal}
        onClose={() => setShowJsonModal(false)}
        title="Transfer Response"
        data={responseData}
      />
    </>
  );
}
