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
  const [isReliance, setIsReliance] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Response viewer state
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [responseData, setResponseData] = useState<unknown>(null);
  
  // Request viewer state
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestData, setRequestData] = useState<unknown>(null);
  const [shouldRefresh, setShouldRefresh] = useState(false);

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [endorsements, setEndorsements] = useState<Record<string, boolean>>({
    base: true,
    sepa: true,
    reliance: true,
    crypto_to_crypto: true,
    spei: true,
    pix: true
  });

  useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      setError(null);
      setLoading(false);
      setResponseData(null);
      setRequestData(null);
      setShouldRefresh(false);
      setFormData({});
      setCustomerType('individual');
      setIsReliance(true);
      setEndorsements({
        base: true,
        sepa: true,
        reliance: true,
        crypto_to_crypto: true,
        spei: true,
        pix: true
      });
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
      setFormData(prev => {
        const newState = {
          ...prev,
          [name]: finalValue
        };

        // Auto-fill issuing_country if nationality changes and issuing_country is empty
        if (name === 'nationality' && customerType === 'individual' && !prev.issuing_country) {
          newState.issuing_country = finalValue;
        }

        return newState;
      });
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
    setResponseData(null);
    setRequestData(null);

    try {
      let payload: any = {
        type: customerType,
        email: formData.email,
        signed_agreement_id: formData.signed_agreement_id,
      };

      // Common fields
      if (customerType === 'individual') {
        payload = {
          ...payload,
          first_name: formData.first_name,
          last_name: formData.last_name,
          birth_date: formData.birth_date,
          phone: formData.phone,
          nationality: formData.nationality,
          residential_address: formData.residential_address,
        };
      } else {
        payload = {
          ...payload,
          business_legal_name: formData.business_legal_name,
          business_type: formData.business_type,
          business_industry: formData.business_industry,
          primary_website: formData.primary_website,
          description: formData.description,
          registered_address: formData.registered_address,
          physical_address: formData.physical_address,
          ein: formData.ein,
        };
      }

      // Endorsements (Always included now)
      const activeEndorsements = Object.entries(endorsements)
        .filter(([_, checked]) => checked)
        .map(([key]) => key);
      
      if (activeEndorsements.length > 0) {
        payload.endorsements = activeEndorsements;
      }

      // Reliance Logic
      if (isReliance) {
        payload.has_accepted_terms_of_service = true;
        
        payload.kyc_screen = {
          screened_at: new Date().toISOString(),
          result: 'passed'
        };
        payload.ofac_screen = {
          screened_at: new Date().toISOString(),
          result: 'passed'
        };
        
        payload.verified_database_at = new Date().toISOString();
        payload.verified_proof_of_address_at = new Date().toISOString();

        // Add identifying info if provided
        if (formData.identification_type || formData.identification_number || formData.issuing_country) {
          payload.identifying_information = [{
            type: formData.identification_type,
            number: formData.identification_number,
            issuing_country: formData.issuing_country
          }];
        }
      } else {
        // Standard Mode - Documents
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

      // Helper to remove empty/null values recursively
      const cleanObject = (obj: any): any => {
        if (Array.isArray(obj)) {
          const cleanedArray = obj.map(v => cleanObject(v)).filter(v => v !== null && v !== undefined && v !== '');
          return cleanedArray.length > 0 ? cleanedArray : undefined;
        }
        if (typeof obj === 'object' && obj !== null) {
          const newObj: any = {};
          Object.entries(obj).forEach(([key, value]) => {
            const cleaned = cleanObject(value);
            if (cleaned !== null && cleaned !== undefined && cleaned !== '' && 
               (typeof cleaned !== 'object' || Object.keys(cleaned).length > 0)) {
              newObj[key] = cleaned;
            }
          });
          return Object.keys(newObj).length > 0 ? newObj : undefined;
        }
        return obj;
      };

      const finalPayload = cleanObject(payload) || {};
      setRequestData(finalPayload);

      const result = await bridgeAPI.createCustomer(finalPayload);
      setResponseData(result);
      setShouldRefresh(true);
    } catch (err) {
      console.error(err);
      // Try to parse error response if available
      if (err instanceof Error) {
         try {
             const jsonErr = JSON.parse(err.message);
             setResponseData(jsonErr);
         } catch {
             setResponseData({ error: err.message });
         }
      } else {
          setResponseData(err);
      }
      
      setError(err instanceof Error ? err.message : 'Failed to create customer');
    } finally {
      setLoading(false);
    }
  };
const handleClose = () => {
    if (shouldRefresh) {
      refreshAll();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl w-full max-w-2xl relative border border-neutral-200 dark:border-neutral-700">
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center bg-neutral-50 dark:bg-neutral-800/30 rounded-t-xl">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Add Customer</h2>
            <button onClick={handleClose} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6">
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

              {success && (
                <div className="bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                  <i className="fas fa-check-circle"></i>
                  Customer Created Successfully!
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Common Fields */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Email</label>
                    <input
                      type="text"
                      name="email"
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Signed Agreement ID</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="signed_agreement_id"
                        value={formData.signed_agreement_id || ''}
                        onChange={handleInputChange}
                        placeholder="UUID of the signed agreement"
                        className="flex-1 px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, signed_agreement_id: generateGuid() }))}
                        className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                      >
                        Generate
                      </button>
                    </div>
                  </div>

                  {/* Individual Fields */}
                  {customerType === 'individual' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">First Name</label>
                        <input
                          type="text"
                          name="first_name"
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Last Name</label>
                        <input
                          type="text"
                          name="last_name"
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Date of Birth</label>
                        <input
                          type="date"
                          name="birth_date"
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
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Type</label>
                            <select
                              name="identification_type"
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
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Number</label>
                            <input
                              type="text"
                              name="identification_number"
                              value={formData.identification_number || ''}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Issuing Country (ISO 3)</label>
                            <input
                              type="text"
                              name="issuing_country"
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
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Legal Business Name</label>
                        <input
                          type="text"
                          name="business_legal_name"
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
                          <option value="cooperative">Cooperative</option>
                          <option value="corporation">Corporation</option>
                          <option value="llc">LLC</option>
                          <option value="other">Other</option>
                          <option value="partnership">Partnership</option>
                          <option value="sole_prop">Sole Proprietorship</option>
                          <option value="trust">Trust</option>
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
                          type="text"
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

                  {/* Endorsements Section (Always Visible) */}
                  <div className="md:col-span-2 border-t border-neutral-200 dark:border-neutral-700 pt-4 mt-2">
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">Endorsements</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.keys(endorsements).map((key) => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={endorsements[key]}
                            onChange={(e) => setEndorsements(prev => ({ ...prev, [key]: e.target.checked }))}
                            className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-900"
                          />
                          <span className="text-sm text-neutral-700 dark:text-neutral-300 capitalize">
                            {key.replace(/_/g, ' ')}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <div className="flex gap-3">
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
                  
                  {/* Debug Buttons (Visible if data exists) */}
                  {(requestData || responseData) && (
                    <div className="flex gap-3 justify-center mt-2">
                      {requestData && (
                        <button
                          type="button"
                          onClick={() => setRequestModalOpen(true)}
                          className="text-xs px-3 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded hover:bg-blue-500/20 transition-colors"
                        >
                          View Last Request
                        </button>
                      )}
                      {responseData && (
                        <button
                          type="button"
                          onClick={() => setResponseModalOpen(true)}
                          className="text-xs px-3 py-1.5 bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20 rounded hover:bg-neutral-500/20 transition-colors"
                        >
                          View Last Response
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </form>
            
          </div>
        </div>
      </div>

      <JsonViewerModal
        isOpen={responseModalOpen}
        onClose={() => setResponseModalOpen(false)}
        title="API Response"
        data={responseData}
      />
      
      <JsonViewerModal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        title="API Request"
        data={requestData}
      />
    </div>
  );
}
