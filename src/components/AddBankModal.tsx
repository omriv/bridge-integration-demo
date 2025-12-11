import { useState } from 'react';
import { useData } from '../context/DataContext';
import { JsonViewerModal } from './JsonViewerModal';

interface AddBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
}

type AccountType = 'us' | 'iban' | 'swift' | 'clabe' | 'pix_key' | 'pix_br_code';

export function AddBankModal({ isOpen, onClose, customerId }: AddBankModalProps) {
  const { createExternalAccount } = useData();
  const [accountType, setAccountType] = useState<AccountType>('us');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Response viewer state
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [responseData, setResponseData] = useState<unknown>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Common
    account_owner_name: '',
    bank_name: '',
    currency: 'usd',
    
    // Beneficiary Address
    street_line_1: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',

    // US
    account_number: '',
    routing_number: '',
    checking_or_savings: 'checking',

    // IBAN
    iban_account_number: '',
    iban_bic: '',
    iban_country: '',

    // Owner Details (IBAN, SWIFT, CLABE, PIX)
    account_owner_type: 'individual',
    first_name: '',
    last_name: '',
    business_name: '',

    // SWIFT
    swift_account_number: '',
    swift_bic: '',
    swift_country: '',
    swift_bank_street: '',
    swift_bank_city: '',
    swift_bank_postal: '',
    swift_bank_country: '',
    swift_category: 'client',
    swift_purpose: 'invoice_for_goods_and_services',
    swift_description: '',

    // CLABE
    clabe_account_number: '',

    // PIX
    pix_key: '',
    pix_document_number: '',
    br_code_string: '',
  });

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

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
      // Base payload with common fields
      let payload: Record<string, unknown> = {
        currency: formData.currency,
        bank_name: formData.bank_name,
        account_owner_name: formData.account_owner_name,
        address: {
          street_line_1: formData.street_line_1,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postal_code,
          country: formData.country,
        }
      };

      switch (accountType) {
        case 'us':
          payload = {
            ...payload,
            account_type: 'us',
            account: {
              account_number: formData.account_number,
              routing_number: formData.routing_number,
              checking_or_savings: formData.checking_or_savings,
            }
          };
          break;

        case 'iban':
          payload = {
            ...payload,
            account_type: 'iban',
            iban: {
              account_number: formData.iban_account_number,
              bic: formData.iban_bic,
              country: formData.iban_country,
            },
            account_owner_type: formData.account_owner_type,
          };
          if (formData.account_owner_type === 'individual') {
            payload.first_name = formData.first_name;
            payload.last_name = formData.last_name;
          } else {
            payload.business_name = formData.business_name;
          }
          break;

        case 'swift':
          payload = {
            ...payload,
            account_type: 'iban', // As per curl example
            swift: {
              account: {
                account_number: formData.swift_account_number,
                bic: formData.swift_bic,
                country: formData.swift_country,
              },
              address: {
                street_line_1: formData.swift_bank_street,
                city: formData.swift_bank_city,
                postal_code: formData.swift_bank_postal,
                country: formData.swift_bank_country,
              },
              category: formData.swift_category,
              purpose_of_funds: [formData.swift_purpose],
              short_business_description: formData.swift_description,
            },
            account_owner_type: formData.account_owner_type,
          };
          if (formData.account_owner_type === 'individual') {
            payload.first_name = formData.first_name;
            payload.last_name = formData.last_name;
          } else {
            payload.business_name = formData.business_name;
          }
          break;

        case 'clabe':
          payload = {
            ...payload,
            account_type: 'clabe',
            clabe: {
              account_number: formData.clabe_account_number,
            },
            account_owner_type: formData.account_owner_type,
          };
          if (formData.account_owner_type === 'individual') {
            payload.first_name = formData.first_name;
            payload.last_name = formData.last_name;
          } else {
            payload.business_name = formData.business_name;
          }
          break;

        case 'pix_key':
          payload = {
            ...payload,
            account_type: 'pix',
            pix_key: {
              pix_key: formData.pix_key,
              document_number: formData.pix_document_number,
            },
            account_owner_type: formData.account_owner_type,
          };
          if (formData.account_owner_type === 'individual') {
            payload.first_name = formData.first_name;
            payload.last_name = formData.last_name;
          } else {
            payload.business_name = formData.business_name;
          }
          break;

        case 'pix_br_code':
          payload = {
            ...payload,
            account_type: 'pix',
            br_code: {
              br_code: formData.br_code_string,
              document_number: formData.pix_document_number,
            },
            account_owner_type: formData.account_owner_type,
          };
          if (formData.account_owner_type === 'individual') {
            payload.first_name = formData.first_name;
            payload.last_name = formData.last_name;
          } else {
            payload.business_name = formData.business_name;
          }
          break;
      }

      const cleanedPayload = removeEmpty(payload) as Record<string, unknown>;
      const result = await createExternalAccount(customerId, cleanedPayload);
      setResponseData(result);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  // Helper to set currency based on type
  const handleTypeChange = (type: AccountType) => {
    setAccountType(type);
    let defaultCurrency = 'usd';
    switch (type) {
      case 'us': defaultCurrency = 'usd'; break;
      case 'iban': defaultCurrency = 'eur'; break;
      case 'swift': defaultCurrency = 'gbp'; break;
      case 'clabe': defaultCurrency = 'mxn'; break;
      case 'pix_key': 
      case 'pix_br_code': defaultCurrency = 'brl'; break;
    }
    setFormData(prev => ({ ...prev, currency: defaultCurrency }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl relative">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Add Bank Account</h2>
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
                <h3 className="text-xl font-bold text-gray-800 mb-2">Account Created Successfully!</h3>
                <p className="text-gray-600 mb-6">The external account has been added to the customer's profile.</p>
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

                {/* Account Type Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'us', label: '🇺🇸 US (ACH/Wire)' },
                      { id: 'iban', label: '🇪🇺 IBAN' },
                      { id: 'swift', label: '🌐 SWIFT' },
                      { id: 'clabe', label: '🇲🇽 CLABE' },
                      { id: 'pix_key', label: '🇧🇷 Pix Key' },
                      { id: 'pix_br_code', label: '🇧🇷 Pix BR Code' },
                    ].map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => handleTypeChange(type.id as AccountType)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                          accountType === type.id
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Common Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Owner Name *</label>
                    <input
                      type="text"
                      name="account_owner_name"
                      required
                      value={formData.account_owner_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                    <input
                      type="text"
                      name="bank_name"
                      value={formData.bank_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g. Chase"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency *</label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 uppercase"
                    >
                      <option value="usd">USD</option>
                      <option value="eur">EUR</option>
                      <option value="gbp">GBP</option>
                      <option value="mxn">MXN</option>
                      <option value="brl">BRL</option>
                    </select>
                  </div>
                </div>

                {/* Type Specific Fields */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                  <h3 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    {accountType === 'us' && 'US Account Details'}
                    {accountType === 'iban' && 'IBAN Details'}
                    {accountType === 'swift' && 'SWIFT Details'}
                    {accountType === 'clabe' && 'CLABE Details'}
                    {accountType === 'pix_key' && 'Pix Key Details'}
                    {accountType === 'pix_br_code' && 'Pix BR Code Details'}
                  </h3>

                  {accountType === 'us' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Routing Number *</label>
                        <input
                          type="text"
                          name="routing_number"
                          required
                          value={formData.routing_number}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Number *</label>
                        <input
                          type="text"
                          name="account_number"
                          required
                          value={formData.account_number}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                        <select
                          name="checking_or_savings"
                          value={formData.checking_or_savings}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="checking">Checking</option>
                          <option value="savings">Savings</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {accountType === 'iban' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">IBAN *</label>
                        <input
                          type="text"
                          name="iban_account_number"
                          required
                          value={formData.iban_account_number}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">BIC (Optional)</label>
                          <input
                            type="text"
                            name="iban_bic"
                            value={formData.iban_bic}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Country (ISO) *</label>
                          <input
                            type="text"
                            name="iban_country"
                            required
                            value={formData.iban_country}
                            onChange={handleInputChange}
                            placeholder="e.g. NLD"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {accountType === 'swift' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Account Number *</label>
                          <input
                            type="text"
                            name="swift_account_number"
                            required
                            value={formData.swift_account_number}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">BIC *</label>
                          <input
                            type="text"
                            name="swift_bic"
                            required
                            value={formData.swift_bic}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Bank Country *</label>
                          <input
                            type="text"
                            name="swift_country"
                            required
                            value={formData.swift_country}
                            onChange={handleInputChange}
                            placeholder="e.g. GBR"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-200 pt-2">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Bank Address *</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <input
                              type="text"
                              name="swift_bank_street"
                              required
                              placeholder="Street"
                              value={formData.swift_bank_street}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-2"
                            />
                          </div>
                          <input
                            type="text"
                            name="swift_bank_city"
                            required
                            placeholder="City"
                            value={formData.swift_bank_city}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                          <input
                            type="text"
                            name="swift_bank_postal"
                            required
                            placeholder="Postal Code"
                            value={formData.swift_bank_postal}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                          <input
                            type="text"
                            name="swift_bank_country"
                            required
                            placeholder="Country"
                            value={formData.swift_bank_country}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-2">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Info</h4>
                        <div className="space-y-2">
                          <select
                            name="swift_category"
                            value={formData.swift_category}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="client">Client</option>
                            <option value="house">House</option>
                          </select>
                          <input
                            type="text"
                            name="swift_purpose"
                            placeholder="Purpose of Funds"
                            value={formData.swift_purpose}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                          <input
                            type="text"
                            name="swift_description"
                            placeholder="Short Business Description"
                            value={formData.swift_description}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {accountType === 'clabe' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CLABE Account Number *</label>
                      <input
                        type="text"
                        name="clabe_account_number"
                        required
                        value={formData.clabe_account_number}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  )}

                  {accountType === 'pix_key' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pix Key *</label>
                        <input
                          type="text"
                          name="pix_key"
                          required
                          value={formData.pix_key}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Document Number *</label>
                        <input
                          type="text"
                          name="pix_document_number"
                          required
                          value={formData.pix_document_number}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  )}

                  {accountType === 'pix_br_code' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">BR Code *</label>
                        <input
                          type="text"
                          name="br_code_string"
                          required
                          value={formData.br_code_string}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Document Number *</label>
                        <input
                          type="text"
                          name="pix_document_number"
                          required
                          value={formData.pix_document_number}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Owner Details for Non-US */}
                  {accountType !== 'us' && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Owner Details</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Owner Type</label>
                          <select
                            name="account_owner_type"
                            value={formData.account_owner_type}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="individual">Individual</option>
                            <option value="business">Business</option>
                          </select>
                        </div>
                        {formData.account_owner_type === 'individual' ? (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                              <input
                                type="text"
                                name="first_name"
                                required
                                value={formData.first_name}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                              <input
                                type="text"
                                name="last_name"
                                required
                                value={formData.last_name}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              />
                            </div>
                          </div>
                        ) : (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                            <input
                              type="text"
                              name="business_name"
                              required
                              value={formData.business_name}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Address Fields */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Beneficiary Address (Optional)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        name="street_line_1"
                        value={formData.street_line_1}
                        onChange={handleInputChange}
                        placeholder="Street Address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="City"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="State / Province"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        name="postal_code"
                        value={formData.postal_code}
                        onChange={handleInputChange}
                        placeholder="Postal Code"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        placeholder="Country (e.g. US)"
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
                      'Create Account'
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
