import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { JsonViewerModal } from './JsonViewerModal';
import { bridgeAPI } from '../services/bridgeAPI';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddCustomerModal({ isOpen, onClose }: AddCustomerModalProps) {
  const { refreshAll } = useData();
  const [customerType, setCustomerType] = useState<'individual' | 'business'>('individual');
  const [isReliance, setIsReliance] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Response viewer state
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [responseData, setResponseData] = useState<unknown>(null);

  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      setError(null);
      setLoading(false);
      setResponseData(null);
      setFormData({});
      setCustomerType('individual');
      setIsReliance(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const generateGuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let finalValue: any = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    // Capitalize country fields
    if ((name.includes('country') || name === 'nationality' || name === 'issuing_country') && typeof finalValue === 'string') {
      finalValue = finalValue.toUpperCase();
    }
    
    // Handle nested fields (e.g. address.street_line_1)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => {
        const newState = {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: finalValue
          }
        };
        
        // Auto-fill nationality if residential_address.country changes and nationality is empty
        if (name === 'residential_address.country' && customerType === 'individual' && !prev.nationality) {
          newState.nationality = finalValue;
        }
        
        return newState;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: finalValue
      }));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // The result is the base64 string
        const base64String = reader.result as string;
        setFormData(prev => ({
          ...prev,
          [fieldName]: base64String
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload: any = {
        type: customerType,
        email: formData.email,
        signed_agreement_id: formData.signed_agreement_id,
      };

      // Common fields
      if (customerType === 'individual') {
        payload.first_name = formData.first_name;
        payload.last_name = formData.last_name;
        payload.birth_date = formData.birth_date;
        payload.phone = formData.phone;
        if (formData.nationality) payload.nationality = formData.nationality;
        if (formData.residential_address) payload.residential_address = formData.residential_address;
      } else {
        payload.business_legal_name = formData.business_legal_name;
        payload.business_type = formData.business_type;
        payload.business_industry = formData.business_industry;
        payload.primary_website = formData.primary_website;
        payload.description = formData.description;
        if (formData.registered_address) payload.registered_address = formData.registered_address;
        if (formData.physical_address) payload.physical_address = formData.physical_address;
      }

      // Reliance Logic
      if (isReliance) {
        payload.endorsements = ['base', 'sepa', 'reliance', 'crypto_to_crypto'];
        payload.has_accepted_terms_of_service = true;
        
        payload.kyc_screen = {
          screened_at: new Date().toISOString(),
          result: 'passed'
        };
        payload.ofac_screen = {
          screened_at: new Date().toISOString(),
          result: 'passed'
        };

        // Add identifying info if provided
        if (formData.identification_type && formData.identification_number && formData.issuing_country) {
          payload.identifying_information = [{
            type: formData.identification_type,
            number: formData.identification_number,
            issuing_country: formData.issuing_country
          }];
        }
      } else {
        // Standard Mode - Documents
        // This is a simplified example. In a real app, you'd handle multiple documents dynamically.
        if (formData.document_front) {
          payload.documents = [
            {
              purposes: ['identification'],
              file: formData.document_front,
              type: 'drivers_license' // Simplified
            }
          ];
        }
      }

      const result = await bridgeAPI.createCustomer(payload);
      setResponseData(result);
      setSuccess(true);
      refreshAll();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to create customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl w-full max-w-2xl relative border border-neutral-200 dark:border-neutral-700">
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center bg-neutral-50 dark:bg-neutral-800/30 rounded-t-xl">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Add Customer</h2>
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
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Customer Created Successfully!</h3>
                <p className="text-neutral-500 dark:text-neutral-400 mb-6">The new customer has been added.</p>
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
                {/* KYC Reliance Toggle */}
                <div className={`flex items-center justify-between p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 ${
                      isReliance ? 'bg-blue-500/10' : 'bg-neutral-100 dark:bg-neutral-800'
                    }`}>
                  <div className="flex flex-col">
                    <span className="font-semibold text-neutral-900 dark:text-white">
                      KYC Reliance
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {isReliance ? 'You are responsible for KYC verification' : 'Bridge handles KYC verification'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsReliance(!isReliance)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                      isReliance ? 'bg-blue-500' : 'bg-neutral-400'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isReliance ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Customer Type Selection */}
                <div className="flex gap-4 border-b border-neutral-200 dark:border-neutral-700 pb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="customerType"
                      value="individual"
                      checked={customerType === 'individual'}
                      onChange={() => setCustomerType('individual')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-neutral-900 dark:text-white font-medium">Individual</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="customerType"
                      value="business"
                      checked={customerType === 'business'}
                      onChange={() => setCustomerType('business')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-neutral-900 dark:text-white font-medium">Business</span>
                  </label>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Common Fields */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Signed Agreement ID *</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="signed_agreement_id"
                        required
                        value={formData.signed_agreement_id || ''}
                        onChange={handleInputChange}
                        placeholder="UUID of the signed agreement"
                        className="flex-1 px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                      />
                      {isReliance && (
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, signed_agreement_id: generateGuid() }))}
                          className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                        >
                          Generate
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Individual Fields */}
                  {customerType === 'individual' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">First Name *</label>
                        <input
                          type="text"
                          name="first_name"
                          required
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Last Name *</label>
                        <input
                          type="text"
                          name="last_name"
                          required
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Date of Birth *</label>
                        <input
                          type="date"
                          name="birth_date"
                          required
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Nationality (ISO 3)</label>
                        <input
                          type="text"
                          name="nationality"
                          maxLength={3}
                          minLength={3}
                          value={formData.nationality || ''}
                          onChange={handleInputChange}
                          placeholder="USA"
                          className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      
                      {/* Residential Address */}
                      <div className="md:col-span-2 border-t border-neutral-200 dark:border-neutral-700 pt-4 mt-2">
                        <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">Residential Address</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">Street Line 1</label>
                            <input
                              type="text"
                              name="residential_address.street_line_1"
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">City</label>
                            <input
                              type="text"
                              name="residential_address.city"
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">State/Subdivision</label>
                            <input
                              type="text"
                              name="residential_address.subdivision"
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">Postal Code</label>
                            <input
                              type="text"
                              name="residential_address.postal_code"
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">Country (ISO 3)</label>
                            <input
                              type="text"
                              name="residential_address.country"
                              maxLength={3}
                              minLength={3}
                              value={formData.residential_address?.country || ''}
                              onChange={handleInputChange}
                              placeholder="USA"
                              className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Identifying Info */}
                      <div className="md:col-span-2 border-t border-neutral-200 dark:border-neutral-700 pt-4 mt-2">
                        <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">Identification</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Type *</label>
                            <select
                              name="identification_type"
                              required
                              value={formData.identification_type || ''}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                            >
                              <option value="">Select...</option>
                              <option value="drivers_license">Drivers License</option>
                              <option value="matriculate_id">Matriculate ID</option>
                              <option value="military_id">Military ID</option>
                              <option value="permanent_residency_id">Permanent Residency ID</option>
                              <option value="state_or_provincial_id">State/Provincial ID</option>
                              <option value="visa">Visa</option>
                              <option value="national_id">National ID</option>
                              <option value="passport">Passport</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Number *</label>
                            <input
                              type="text"
                              name="identification_number"
                              required
                              value={formData.identification_number || ''}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Issuing Country (ISO 3) *</label>
                            <input
                              type="text"
                              name="issuing_country"
                              required
                              maxLength={3}
                              minLength={3}
                              value={formData.issuing_country || ''}
                              onChange={handleInputChange}
                              placeholder="USA"
                              className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Business Fields */}
                  {customerType === 'business' && (
                    <>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Legal Business Name *</label>
                        <input
                          type="text"
                          name="business_legal_name"
                          required
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Business Type</label>
                        <select
                          name="business_type"
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                        >
                          <option value="">Select...</option>
                          <option value="corporation">Corporation</option>
                          <option value="llc">LLC</option>
                          <option value="partnership">Partnership</option>
                          <option value="sole_proprietorship">Sole Proprietorship</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">EIN</label>
                        <input
                          type="text"
                          name="ein"
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Website</label>
                        <input
                          type="url"
                          name="primary_website"
                          onChange={handleInputChange}
                          placeholder="https://..."
                          className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      {/* Registered Address */}
                      <div className="md:col-span-2 border-t border-neutral-200 dark:border-neutral-700 pt-4 mt-2">
                        <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">Registered Address</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">Street Line 1</label>
                            <input
                              type="text"
                              name="registered_address.street_line_1"
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">City</label>
                            <input
                              type="text"
                              name="registered_address.city"
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">State/Subdivision</label>
                            <input
                              type="text"
                              name="registered_address.subdivision"
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">Postal Code</label>
                            <input
                              type="text"
                              name="registered_address.postal_code"
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">Country (ISO 3)</label>
                            <input
                              type="text"
                              name="registered_address.country"
                              maxLength={3}
                              minLength={3}
                              value={formData.registered_address?.country || ''}
                              onChange={handleInputChange}
                              placeholder="USA"
                              className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Documents (Only if NOT Reliance) */}
                  {!isReliance && (
                    <div className="md:col-span-2 border-t border-neutral-200 dark:border-neutral-700 pt-4 mt-2">
                      <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">Documents</h4>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">ID Document (Front)</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'document_front')}
                          className="w-full text-sm text-neutral-500 dark:text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-6 py-3 rounded-lg font-semibold hover:bg-amber-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
                        Creating...
                      </>
                    ) : (
                      'Create Customer'
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
