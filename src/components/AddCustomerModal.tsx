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
  const [emailError, setEmailError] = useState<string | null>(null);
  const [showRelianceTooltip, setShowRelianceTooltip] = useState(false);
  
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
      setIsReliance(false);
      setEmailError(null);
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

  const generateRandomData = () => {
    const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
    const streets = ['123 Main St', '456 Oak Ave', '789 Pine Rd', '321 Elm Dr', '654 Maple Ln'];
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];
    const states = ['NY', 'CA', 'IL', 'TX', 'AZ'];
    
    const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const randomEmail = `${randomFirstName.toLowerCase()}.${randomLastName.toLowerCase()}${Math.floor(Math.random() * 1000)}@example.com`;
    
    const randomDate = new Date(1970 + Math.floor(Math.random() * 35), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    const formattedDate = randomDate.toISOString().split('T')[0];
    
    const randomStreet = streets[Math.floor(Math.random() * streets.length)];
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    const randomState = states[Math.floor(Math.random() * states.length)];
    const randomZip = String(10000 + Math.floor(Math.random() * 90000));
    
    if (customerType === 'individual') {
      setFormData({
        email: randomEmail,
        signed_agreement_id: generateGuid(),
        first_name: randomFirstName,
        last_name: randomLastName,
        birth_date: formattedDate,
        phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        nationality: 'USA',
        residential_address: {
          street_line_1: randomStreet,
          city: randomCity,
          subdivision: randomState,
          postal_code: randomZip,
          country: 'USA'
        },
        identification_type: 'drivers_license',
        identification_number: `DL${Math.floor(Math.random() * 90000000) + 10000000}`,
        issuing_country: 'USA'
      });
    } else {
      const businessNames = ['Tech Solutions Inc', 'Global Industries LLC', 'Innovation Corp', 'Enterprise Systems'];
      const randomBusiness = businessNames[Math.floor(Math.random() * businessNames.length)];
      
      setFormData({
        email: randomEmail,
        signed_agreement_id: generateGuid(),
        business_legal_name: randomBusiness,
        business_type: 'llc',
        ein: `${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 9000000) + 1000000}`,
        primary_website: `https://www.${randomBusiness.toLowerCase().replace(/\s+/g, '')}.com`,
        registered_address: {
          street_line_1: randomStreet,
          city: randomCity,
          subdivision: randomState,
          postal_code: randomZip,
          country: 'USA'
        }
      });
    }
    setEmailError(null);
  };

  const validateEmail = (email: string): boolean => {
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let finalValue: any = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    // Validate email on change
    if (name === 'email') {
      validateEmail(value);
    }

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
    
    // Validate email before submission
    if (!validateEmail(formData.email)) {
      return;
    }
    
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
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-900 dark:text-white">
                      KYC Reliance
                    </span>
                    <div className="relative">
                      <button
                        type="button"
                        onMouseEnter={() => setShowRelianceTooltip(true)}
                        onMouseLeave={() => setShowRelianceTooltip(false)}
                        className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </button>
                      {showRelianceTooltip && (
                        <div className="absolute left-0 top-6 z-10 w-64 p-3 bg-neutral-800 dark:bg-neutral-700 text-white text-xs rounded-lg shadow-lg">
                          Reliance mode will create a customer with all capabilities auto approved. Use this mode only for testing purposes only! Keep in mind - real customers will not be created in full reliance mode.
                          <div className="absolute -top-1 left-4 w-2 h-2 bg-neutral-800 dark:bg-neutral-700 transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {isReliance ? 'You are responsible for KYC verification' : 'Bridge handles KYC verification'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newRelianceState = !isReliance;
                    setIsReliance(newRelianceState);
                    if (newRelianceState) {
                      generateRandomData();
                    }
                  }}
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
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 py-2 bg-white dark:bg-neutral-900 border ${
                        emailError ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'
                      } rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500`}
                    />
                    {emailError && (
                      <p className="mt-1 text-xs text-red-500">{emailError}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Signed Agreement ID {!isReliance && <span className="text-red-500">*</span>}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="signed_agreement_id"
                        value={formData.signed_agreement_id || ''}
                        onChange={handleInputChange}
                        placeholder="UUID of the signed agreement"
                        required={!isReliance}
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
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          First Name {!isReliance && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name || ''}
                          onChange={handleInputChange}
                          required={!isReliance}
                          className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Last Name {!isReliance && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name || ''}
                          onChange={handleInputChange}
                          required={!isReliance}
                          className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Date of Birth {!isReliance && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type="date"
                          name="birth_date"
                          value={formData.birth_date || ''}
                          onChange={handleInputChange}
                          required={!isReliance}
                          className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone || ''}
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
                        <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
                          Residential Address {!isReliance && <span className="text-red-500">*</span>}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Street Line 1 {!isReliance && <span className="text-red-500">*</span>}
                            </label>
                            <input
                              type="text"
                              name="residential_address.street_line_1"
                              value={formData.residential_address?.street_line_1 || ''}
                              onChange={handleInputChange}
                              required={!isReliance}
                              className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              City {!isReliance && <span className="text-red-500">*</span>}
                            </label>
                            <input
                              type="text"
                              name="residential_address.city"
                              value={formData.residential_address?.city || ''}
                              onChange={handleInputChange}
                              required={!isReliance}
                              className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">State/Subdivision</label>
                            <input
                              type="text"
                              name="residential_address.subdivision"
                              value={formData.residential_address?.subdivision || ''}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">Postal Code</label>
                            <input
                              type="text"
                              name="residential_address.postal_code"
                              value={formData.residential_address?.postal_code || ''}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Country (ISO 3) {!isReliance && <span className="text-red-500">*</span>}
                            </label>
                            <input
                              type="text"
                              name="residential_address.country"
                              value={formData.residential_address?.country || ''}
                              onChange={handleInputChange}
                              placeholder="USA"
                              required={!isReliance}
                              className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Identifying Info */}
                      <div className="md:col-span-2 border-t border-neutral-200 dark:border-neutral-700 pt-4 mt-2">
                        <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
                          Identification {!isReliance && <span className="text-red-500">*</span>}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                              Type {!isReliance && <span className="text-red-500">*</span>}
                            </label>
                            <select
                              name="identification_type"
                              value={formData.identification_type || ''}
                              onChange={handleInputChange}
                              required={!isReliance}
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
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                              Number {!isReliance && <span className="text-red-500">*</span>}
                            </label>
                            <input
                              type="text"
                              name="identification_number"
                              value={formData.identification_number || ''}
                              onChange={handleInputChange}
                              required={!isReliance}
                              className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                              Issuing Country (ISO 3) {!isReliance && <span className="text-red-500">*</span>}
                            </label>
                            <input
                              type="text"
                              name="issuing_country"
                              value={formData.issuing_country || ''}
                              onChange={handleInputChange}
                              placeholder="USA"
                              required={!isReliance}
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
                          value={formData.business_legal_name || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Business Type</label>
                        <select
                          name="business_type"
                          value={formData.business_type || ''}
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
                          value={formData.ein || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Website</label>
                        <input
                          type="text"
                          name="primary_website"
                          value={formData.primary_website || ''}
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
                              value={formData.registered_address?.street_line_1 || ''}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">City</label>
                            <input
                              type="text"
                              name="registered_address.city"
                              value={formData.registered_address?.city || ''}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">State/Subdivision</label>
                            <input
                              type="text"
                              name="registered_address.subdivision"
                              value={formData.registered_address?.subdivision || ''}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">Postal Code</label>
                            <input
                              type="text"
                              name="registered_address.postal_code"
                              value={formData.registered_address?.postal_code || ''}
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
                  {!isReliance && customerType === 'individual' && (
                    <div className="md:col-span-2 border-t border-neutral-200 dark:border-neutral-700 pt-4 mt-2">
                      <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
                        Documents <span className="text-red-500">*</span>
                      </h4>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          ID Document (Front) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'document_front')}
                          required={!isReliance && customerType === 'individual'}
                          className="w-full text-sm text-neutral-500 dark:text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                        />
                        {formData.document_front && (
                          <p className="mt-1 text-xs text-green-600 dark:text-green-400">✓ Document uploaded</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Endorsements Section (Always Visible) */}
                  <div className="md:col-span-2 border-t border-neutral-200 dark:border-neutral-700 pt-4 mt-2">
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
                      Endorsements {!isReliance && <span className="text-red-500">*</span>}
                    </h4>
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
                    {!isReliance && !Object.values(endorsements).some(v => v) && (
                      <p className="mt-2 text-xs text-red-500">At least one endorsement must be selected</p>
                    )}
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
                  {(Boolean(requestData) || Boolean(responseData)) && (
                    <div className="flex gap-3 justify-center mt-2">
                      {Boolean(requestData) && (
                        <button
                          type="button"
                          onClick={() => setRequestModalOpen(true)}
                          className="text-xs px-3 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded hover:bg-blue-500/20 transition-colors"
                        >
                          View Last Request
                        </button>
                      )}
                      {Boolean(responseData) && (
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
