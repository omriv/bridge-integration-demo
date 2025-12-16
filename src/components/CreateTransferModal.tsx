import { useState, useEffect } from 'react';
import { JsonViewerModal } from './JsonViewerModal';
import { GetDestinationAddressModal } from './GetDestinationAddressModal';
import { GetExternalAccountModal } from './GetExternalAccountModal';
import type { WalletBalance, LiquidationAddress, ExternalAccount } from '../types';
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
  onSuccess?: () => void;
}

export function CreateTransferModal({
  isOpen,
  onClose,
  walletId,
  customerId,
  walletAddress,
  walletChain,
  walletBalances,
  onSuccess,
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
    source_payment_rail: 'bridge_wallet',
    source_external_account_id: '',
    source_bridge_wallet_id: walletId,
    source_from_address: '',
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
  const [showGetAddressModal, setShowGetAddressModal] = useState(false);
  const [showGetExternalAccountModal, setShowGetExternalAccountModal] = useState(false);
  
  // Routing state
  const [availableRoutes, setAvailableRoutes] = useState<Route[]>([]);
  const [destinationRails, setDestinationRails] = useState<string[]>([]);
  const [destinationCurrencies, setDestinationCurrencies] = useState<string[]>([]);

  // Fetch available routes when source changes
  useEffect(() => {
    const fetchRoutes = async () => {
      const routes = await getAvailableRoutes(formData.source_payment_rail, formData.source_currency);
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
    
    if (isOpen && formData.source_payment_rail && formData.source_currency) {
      fetchRoutes();
    }
  }, [formData.source_payment_rail, formData.source_currency, isOpen]);
  
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
  
  // Update source fields when payment rail changes
  useEffect(() => {
    if (formData.source_payment_rail === 'bridge_wallet') {
      setFormData(prev => ({
        ...prev,
        source_bridge_wallet_id: walletId,
        source_from_address: ''
      }));
    } else if (formData.source_payment_rail === 'solana') {
      setFormData(prev => ({
        ...prev,
        source_bridge_wallet_id: '',
        source_from_address: walletAddress
      }));
    }
  }, [formData.source_payment_rail, walletId, walletAddress]);

  const handleAddressSelect = (address: LiquidationAddress) => {
    setFormData(prev => ({
      ...prev,
      destination_to_address: address.address,
      destination_payment_rail: railToApiFormat(address.chain),
      destination_currency: address.currency !== 'any' ? address.currency.toLowerCase() : prev.destination_currency
    }));
    setShowGetAddressModal(false);
  };

  const handleExternalAccountSelect = (account: ExternalAccount) => {
    setFormData(prev => ({
      ...prev,
      destination_external_account_id: account.id,
      // Map account type to payment rail if possible, otherwise default to ach
      destination_payment_rail: railToApiFormat((account.type || account.account_type || 'ach') as string),
      destination_currency: account.currency.toLowerCase(),
      // Clear other destination fields to maintain exclusivity
      destination_to_address: '',
      destination_bridge_wallet_id: ''
    }));
    setShowGetExternalAccountModal(false);
  };

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
    if (formData.amount) {
      if (!/^\d+(\.\d+)?$/.test(formData.amount)) {
        newErrors.amount = 'Amount must be a valid decimal number';
      } else if (parseFloat(formData.amount) > 10) {
        newErrors.amount = 'Amount cannot exceed 10';
      }
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
    if (formData.source_payment_rail === 'bridge_wallet') {
      if (!formData.source_bridge_wallet_id) {
        newErrors.source_bridge_wallet_id = 'Bridge Wallet ID is required when using bridge_wallet';
      }
    }
    
    if (formData.source_payment_rail === 'solana') {
      if (!formData.source_from_address) {
        newErrors.source_from_address = 'From address is required when using solana';
      }
    }
    
    if (formData.source_payment_rail === 'ethereum' || formData.source_payment_rail === 'polygon' || formData.source_payment_rail === 'base') {
      if (!formData.source_from_address && !formData.allow_any_from_address) {
        newErrors.source_from_address = 'From address is required for crypto sources (or enable allow_any_from_address)';
      }
    }

    // Destination validation - One and only one
    const destinationFields = [
      formData.destination_to_address,
      formData.destination_bridge_wallet_id,
      formData.destination_external_account_id
    ].filter(Boolean);

    if (destinationFields.length !== 1) {
      const errorMsg = 'Exactly one destination target (Address, Wallet ID, or External Account ID) is required';
      newErrors.destination_to_address = errorMsg;
      newErrors.destination_bridge_wallet_id = errorMsg;
      newErrors.destination_external_account_id = errorMsg;
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
      
      // Only include bridge_wallet_id if source rail is bridge_wallet
      if (formData.source_payment_rail === 'bridge_wallet' && formData.source_bridge_wallet_id) {
        source.bridge_wallet_id = formData.source_bridge_wallet_id;
      }
      
      // Only include from_address if source rail is solana
      if (formData.source_payment_rail === 'solana' && formData.source_from_address) {
        source.from_address = formData.source_from_address;
      }

      // Build destination object
      const destination: Record<string, unknown> = {
        currency: formData.destination_currency,
        payment_rail: formData.destination_payment_rail,
      };

      if (formData.destination_external_account_id) destination.external_account_id = formData.destination_external_account_id;
      if (formData.destination_bridge_wallet_id) destination.bridge_wallet_id = formData.destination_bridge_wallet_id;
      if (formData.destination_to_address) destination.to_address = formData.destination_to_address;
      
      // Payment rail specific fields
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
        if (onSuccess) {
          onSuccess();
        }
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
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };

      // Mutual exclusivity for destination fields
      if (name === 'destination_to_address' && value) {
        newData.destination_bridge_wallet_id = '';
        newData.destination_external_account_id = '';
      } else if (name === 'destination_bridge_wallet_id' && value) {
        newData.destination_to_address = '';
        newData.destination_external_account_id = '';
      } else if (name === 'destination_external_account_id' && value) {
        newData.destination_to_address = '';
        newData.destination_bridge_wallet_id = '';
      }

      return newData;
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Filter destination rails based on input fields
  const filteredDestinationRails = (() => {
    // Start with available rails
    const rails = [...destinationRails];
    
    // Always add Bridge Wallet if not present
    if (!rails.includes('Bridge Wallet')) {
      rails.push('Bridge Wallet');
    }

    // Filter based on active input
    if (formData.destination_bridge_wallet_id) {
      return rails.filter(r => r === 'Bridge Wallet');
    }
    
    if (formData.destination_to_address) {
      // Filter out fiat/banking rails + Bridge Wallet
      const excluded = ['Bridge Wallet', 'ACH', 'Wire', 'SEPA', 'SPEI'];
      return rails.filter(r => !excluded.includes(r));
    }
    
    if (formData.destination_external_account_id) {
      // Only allow fiat/banking rails
      const allowed = ['ACH', 'Wire', 'SEPA', 'SPEI'];
      return rails.filter(r => allowed.includes(r));
    }

    return rails;
  })();

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-4xl w-full my-8 border border-neutral-200 dark:border-neutral-700">
          {/* Header */}
          <div className="bg-neutral-50 dark:bg-neutral-800/30 border-b border-neutral-200 dark:border-neutral-700 p-6 rounded-t-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Create Transfer</h2>
              <button
                onClick={onClose}
                className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-white text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Customer: {customerId} • Wallet: {walletId}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="space-y-6">
              {/* Source Section */}
              <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 space-y-4">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-700 pb-2">Source</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-400 mb-1">
                      Payment Rail <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="source_payment_rail"
                      value={formData.source_payment_rail}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="bridge_wallet">Bridge Wallet</option>
                      <option value="solana">Solana</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-400 mb-1">
                      Currency <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="source_currency"
                      value={formData.source_currency}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-amber-500 max-h-40 overflow-y-auto"
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
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-400 mb-1">
                      Bridge Wallet ID {formData.source_payment_rail === 'bridge_wallet' && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      name="source_bridge_wallet_id"
                      value={formData.source_bridge_wallet_id}
                      onChange={handleChange}
                      disabled={formData.source_payment_rail !== 'bridge_wallet'}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 font-mono text-sm ${
                        formData.source_payment_rail !== 'bridge_wallet' 
                          ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed border-neutral-300 dark:border-neutral-600' 
                          : `bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white ${errors.source_bridge_wallet_id ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'}`
                      }`}
                      placeholder={walletId}
                    />
                    {errors.source_bridge_wallet_id && <p className="text-red-500 text-xs mt-1">{errors.source_bridge_wallet_id}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-400 mb-1">
                      External Account ID
                    </label>
                    <input
                      type="text"
                      name="source_external_account_id"
                      value={formData.source_external_account_id}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-400 mb-1">
                      From Address {formData.source_payment_rail === 'solana' && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      name="source_from_address"
                      value={formData.source_from_address}
                      onChange={handleChange}
                      disabled={formData.source_payment_rail !== 'solana'}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 font-mono text-sm ${
                        formData.source_payment_rail !== 'solana'
                          ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed border-neutral-300 dark:border-neutral-600'
                          : `bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white ${errors.source_from_address ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'}`
                      }`}
                      placeholder={walletAddress}
                    />
                    {errors.source_from_address && <p className="text-red-500 text-xs mt-1">{errors.source_from_address}</p>}
                  </div>
                </div>
              </div>

              {/* Amount Section */}
              <div className="border-b border-neutral-200 dark:border-neutral-700 pb-4">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">Transfer Amount</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Amount
                    </label>
                    <input
                      type="text"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      disabled={formData.flexible_amount}
                      className={`w-full px-3 py-2 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border rounded-lg focus:ring-2 focus:ring-amber-500 ${errors.amount ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'}`}
                      placeholder="10.50"
                    />
                    {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                    {availableBalance > 0 && (
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        <i className="fas fa-coins mr-1"></i> Available: {availableBalance.toLocaleString()} {formData.source_currency.toUpperCase()}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Client Reference ID
                    </label>
                    <input
                      type="text"
                      name="client_reference_id"
                      value={formData.client_reference_id}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border rounded-lg focus:ring-2 focus:ring-amber-500 ${errors.client_reference_id ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'}`}
                      placeholder="Optional (1-256 chars)"
                    />
                    {errors.client_reference_id && <p className="text-red-500 text-xs mt-1">{errors.client_reference_id}</p>}
                  </div>
                </div>
              </div>

              {/* Destination Section */}
              <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 space-y-4">
                <div className="flex justify-between items-center border-b border-neutral-200 dark:border-neutral-700 pb-2">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Destination</h3>
                </div>
                {destinationRails.length === 0 && (
                  <p className="text-sm text-amber-600 dark:text-amber-400 mb-3 p-2 bg-amber-500/10 border border-amber-500/30 rounded flex items-center gap-2">
                    <i className="fas fa-exclamation-triangle"></i>
                    No available routes found for {formData.source_payment_rail.toUpperCase()} {formData.source_currency.toUpperCase()}
                  </p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-400">
                        To Address (for crypto destinations) <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowGetAddressModal(true)}
                        className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium flex items-center gap-1"
                      >
                        <i className="fas fa-search"></i> Get Destination Liquidation Address
                      </button>
                    </div>
                    <input
                      type="text"
                      name="destination_to_address"
                      value={formData.destination_to_address}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border rounded-lg focus:ring-2 focus:ring-amber-500 ${errors.destination_to_address ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'}`}
                      placeholder={walletAddress}
                    />
                    {errors.destination_to_address && <p className="text-red-500 text-xs mt-1">{errors.destination_to_address}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-400 mb-1">
                      Bridge Wallet ID
                    </label>
                    <input
                      type="text"
                      name="destination_bridge_wallet_id"
                      value={formData.destination_bridge_wallet_id}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-400">
                        External Account ID
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowGetExternalAccountModal(true)}
                        className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium flex items-center gap-1"
                      >
                        <i className="fas fa-search"></i> Get External Account
                      </button>
                    </div>
                    <input
                      type="text"
                      name="destination_external_account_id"
                      value={formData.destination_external_account_id}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-400 mb-1">
                      Payment Rail <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="destination_payment_rail"
                      value={formData.destination_payment_rail}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-amber-500 max-h-40 overflow-y-auto"
                      size={1}
                      disabled={filteredDestinationRails.length === 0}
                    >
                      {filteredDestinationRails.length > 0 ? (
                        filteredDestinationRails.map((rail) => (
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
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-400 mb-1">
                      Currency <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="destination_currency"
                      value={formData.destination_currency}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-amber-500 max-h-40 overflow-y-auto"
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
                </div>
              </div>

              {/* Developer Fee Section */}
              <div className="border-b border-neutral-200 dark:border-neutral-700 pb-4">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">Developer Fee</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Fixed Fee (amount)
                    </label>
                    <input
                      type="text"
                      name="developer_fee"
                      value={formData.developer_fee}
                      onChange={handleChange}
                      disabled={formData.flexible_amount}
                      className={`w-full px-3 py-2 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border rounded-lg focus:ring-2 focus:ring-amber-500 ${errors.developer_fee ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'}`}
                      placeholder="0.50"
                    />
                    {errors.developer_fee && <p className="text-red-500 text-xs mt-1">{errors.developer_fee}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Percentage Fee (0.0-100.0)
                    </label>
                    <input
                      type="text"
                      name="developer_fee_percent"
                      value={formData.developer_fee_percent}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border rounded-lg focus:ring-2 focus:ring-amber-500 ${errors.developer_fee_percent ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'}`}
                      placeholder="1.0"
                    />
                    {errors.developer_fee_percent && <p className="text-red-500 text-xs mt-1">{errors.developer_fee_percent}</p>}
                  </div>
                </div>
              </div>

              {/* Features Section */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">Features & Options</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="flexible_amount"
                      checked={formData.flexible_amount}
                      onChange={handleChange}
                      className="mr-2 h-4 w-4 text-amber-600 focus:ring-amber-500 border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-900"
                    />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">Flexible Amount (matches any amount deposited)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="allow_any_from_address"
                      checked={formData.allow_any_from_address}
                      onChange={handleChange}
                      className="mr-2 h-4 w-4 text-amber-600 focus:ring-amber-500 border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-900"
                    />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">Allow Any From Address (recommended for crypto deposits)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="static_template"
                      checked={formData.static_template}
                      onChange={handleChange}
                      className="mr-2 h-4 w-4 text-amber-600 focus:ring-amber-500 border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-900"
                    />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">Static Template</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="dry_run"
                      checked={formData.dry_run}
                      onChange={handleChange}
                      className="mr-2 h-4 w-4 text-amber-600 focus:ring-amber-500 border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-900"
                    />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">Dry Run (validate without creating)</span>
                  </label>
                </div>
              </div>

              {/* Messages */}
              {successMessage && (
                <div className="bg-green-500/10 border-l-4 border-green-500 p-4 rounded">
                  <p className="text-green-600 dark:text-green-400 font-semibold">{successMessage}</p>
                </div>
              )}
              {errorMessage && (
                <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded">
                  <p className="text-red-600 dark:text-red-400 font-semibold">{errorMessage}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-6 py-3 rounded-lg font-semibold hover:bg-amber-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Send Transfer'}
                </button>
                {responseData && (
                  <button
                    type="button"
                    onClick={() => setShowJsonModal(true)}
                    className="bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20 px-6 py-3 rounded-lg font-semibold hover:bg-neutral-500/20 transition-colors"
                  >
                    View JSON
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20 px-6 py-3 rounded-lg font-semibold hover:bg-neutral-500/20 transition-colors"
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

      <GetDestinationAddressModal
        isOpen={showGetAddressModal}
        onClose={() => setShowGetAddressModal(false)}
        onSelectAddress={handleAddressSelect}
        currentChain={walletChain}
        sourceCurrency={formData.source_currency}
      />

      <GetExternalAccountModal
        isOpen={showGetExternalAccountModal}
        onClose={() => setShowGetExternalAccountModal(false)}
        onSelectAccount={handleExternalAccountSelect}
        customerId={customerId}
      />
    </>
  );
}
