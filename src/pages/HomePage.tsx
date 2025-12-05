import { useEffect, useState } from 'react'
import { useData } from '../context/DataContext'
import { CustomerDetails } from '../components/CustomerDetails'
import { WalletCard } from '../components/WalletCard'
import { VirtualAccountCard } from '../components/VirtualAccountCard'
import { bridgeAPI } from '../services/bridgeAPI'
import type { VirtualAccount } from '../types'

export function HomePage() {
  const { customer, customers, currentCustomerId, wallets, loading, error, loadCustomerData, setCurrentCustomerId, refreshAll } = useData();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [virtualAccounts, setVirtualAccounts] = useState<VirtualAccount[]>([]);
  const [virtualAccountsLoading, setVirtualAccountsLoading] = useState(false);

  useEffect(() => {
    if (!customer) {
      loadCustomerData();
    }
  }, [customer, loadCustomerData]);

  useEffect(() => {
    const loadVirtualAccounts = async () => {
      if (!customer) {
        setVirtualAccounts([]);
        return;
      }
      
      try {
        setVirtualAccountsLoading(true);
        const response = await bridgeAPI.getVirtualAccounts(customer.id);
        setVirtualAccounts(response.data);
      } catch (error) {
        console.error('Error loading virtual accounts:', error);
        setVirtualAccounts([]);
      } finally {
        setVirtualAccountsLoading(false);
      }
    };
    
    loadVirtualAccounts();
  }, [customer]);

  const handleCustomerChange = async (customerId: string) => {
    setCurrentCustomerId(customerId);
    setIsDropdownOpen(false);
    await loadCustomerData(customerId);
  };

  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-700';
    switch (status.toLowerCase()) {
      case 'active':
      case 'complete':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
      case 'incomplete':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading customer data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500 mb-6">
              Please make sure you've configured your API key and customer ID in the config.ts file.
            </p>
          </div>
          <button
            onClick={refreshAll}
            className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Show customer selector if no customer is loaded but we have customers list
  if (!customer && customers.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Select a Customer</h2>
            <p className="text-gray-600 mb-6">
              Choose a customer from the list below to view their details and wallets.
            </p>
          </div>
          <div className="max-h-96 overflow-y-auto border-2 border-gray-300 rounded-lg">
            {customers.map((cust) => (
              <button
                key={cust.id}
                onClick={() => handleCustomerChange(cust.id)}
                className="w-full px-4 py-3 text-left hover:bg-indigo-50 transition-colors border-b border-gray-200 last:border-b-0"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">
                      {cust.full_name || cust.email || 'Unnamed Customer'}
                    </div>
                    <div className="font-mono text-xs text-gray-600 truncate">
                      {cust.id}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                    {cust.status && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(cust.status)}`}>
                        {cust.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    )}
                    {cust.kyc_status && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(cust.kyc_status)}`}>
                        KYC: {cust.kyc_status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Bridge Integration <span className="text-indigo-600">Demo</span>
          </h1>
          <p className="text-gray-600">Customer Details & Wallet Management</p>
          
          {/* Customer Selector Dropdown */}
          {customers.length > 0 && (
            <div className="mt-4 max-w-md mx-auto relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-white border-2 border-gray-300 rounded-lg px-4 py-3 flex items-center justify-between hover:border-indigo-400 transition-colors shadow-sm"
              >
                <div className="flex items-center gap-3 flex-1 text-left">
                  <span className="text-sm font-semibold text-gray-700">Current Customer:</span>
                  {customer && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm text-gray-900">
                        {customer.full_name || customer.email || customer.id.substring(0, 12) + '...'}
                      </span>
                      {customer.status && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(customer.status)}`}>
                          {customer.status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      )}
                      {customer.kyc_status && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(customer.kyc_status)}`}>
                          KYC: {customer.kyc_status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <svg
                  className={`w-5 h-5 text-gray-600 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute z-20 w-full mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-xl max-h-96 overflow-y-auto">
                  {customers.map((cust) => (
                    <button
                      key={cust.id}
                      onClick={() => handleCustomerChange(cust.id)}
                      className={`w-full px-4 py-3 text-left hover:bg-indigo-50 transition-colors border-b border-gray-200 last:border-b-0 ${
                        cust.id === currentCustomerId ? 'bg-indigo-100' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 truncate">
                            {cust.full_name || cust.email || 'Unnamed Customer'}
                          </div>
                          <div className="font-mono text-xs text-gray-600 truncate">
                            {cust.id}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                          {cust.status && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(cust.status)}`}>
                              {cust.status.replace(/_/g, ' ').toUpperCase()}
                            </span>
                          )}
                          {cust.kyc_status && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(cust.kyc_status)}`}>
                              KYC: {cust.kyc_status.replace(/_/g, ' ').toUpperCase()}
                            </span>
                          )}
                          {cust.tos_status && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(cust.tos_status)}`}>
                              ToS: {cust.tos_status.replace(/_/g, ' ').toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Customer Details */}
        {customer && <CustomerDetails customer={customer} />}

        {/* Wallets Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="text-indigo-600 mr-2">💼</span>
            Customer Wallets
            <span className="ml-3 text-sm font-normal text-gray-600">
              ({wallets.length} {wallets.length === 1 ? 'wallet' : 'wallets'})
            </span>
          </h2>

          {wallets.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="text-gray-400 text-5xl mb-4">📭</div>
              <p className="text-gray-600">No wallets found for this customer</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {wallets.map((wallet) => (
                <WalletCard key={wallet.id} wallet={wallet} />
              ))}
            </div>
          )}
        </div>

        {/* Virtual Accounts Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="text-indigo-600 mr-2">🏦</span>
            Virtual Accounts
            <span className="ml-3 text-sm font-normal text-gray-600">
              ({virtualAccounts.length} {virtualAccounts.length === 1 ? 'account' : 'accounts'})
            </span>
          </h2>

          {virtualAccountsLoading ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading virtual accounts...</p>
            </div>
          ) : virtualAccounts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="text-gray-400 text-5xl mb-4">📭</div>
              <p className="text-gray-600">No virtual accounts found for this customer</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {virtualAccounts.map((account) => (
                <VirtualAccountCard key={account.id} virtualAccount={account} />
              ))}
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <div className="text-center">
          <button
            onClick={refreshAll}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>
    </div>
  )
}
