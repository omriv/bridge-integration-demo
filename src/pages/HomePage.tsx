import { useEffect, useState } from 'react'
import { useData } from '../context/DataContext'
import { CustomerDetails } from '../components/CustomerDetails'
import { AddBankModal } from '../components/AddBankModal'
import { AddWalletModal } from '../components/AddWalletModal'
import { AddCustomerModal } from '../components/AddCustomerModal'
import { WalletsSection } from '../components/WalletsSection'
import { BankAccountsSection } from '../components/BankAccountsSection'
import { VirtualAccountsSection } from '../components/VirtualAccountsSection'

export function HomePage() {
  const { customer, customers, currentCustomerId, wallets, loading, error, loadCustomerData, setCurrentCustomerId, refreshAll, virtualAccounts, virtualAccountsLoading, externalAccounts } = useData();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Modal states
  const [isAddBankModalOpen, setIsAddBankModalOpen] = useState(false);
  const [isAddWalletModalOpen, setIsAddWalletModalOpen] = useState(false);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);

  useEffect(() => {
    if (!customer) {
      loadCustomerData();
    }
  }, [customer, loadCustomerData]);

  const handleCustomerChange = async (customerId: string) => {
    setCurrentCustomerId(customerId);
    setIsDropdownOpen(false);
    await loadCustomerData(customerId);
  };

  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-600';
    switch (status.toLowerCase()) {
      case 'active':
      case 'complete':
        return 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20';
      case 'pending':
      case 'under_review':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20';
      case 'rejected':
      case 'incomplete':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20';
      default:
        return 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-4 md:p-8 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          {/* Header - Always Visible */}
          <div className="text-center mb-8">
            <p className="text-neutral-500 dark:text-neutral-400">Customer Details & Wallet Management</p>
          </div>

          {/* Loading State */}
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-500 mx-auto mb-4"></div>
              <p className="text-neutral-500 dark:text-neutral-400 text-lg">Loading customer data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-4 md:p-8 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          {/* Header - Always Visible */}
          <div className="text-center mb-8">
            <p className="text-neutral-500 dark:text-neutral-400">Customer Details & Wallet Management</p>
          </div>

          {/* Error State */}
          <div className="max-w-md mx-auto bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-8 border border-neutral-200 dark:border-neutral-700">
            <div className="text-center mb-6">
              <div className="text-red-500 text-5xl mb-4"><i className="fas fa-exclamation-triangle"></i></div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Error Loading Data</h2>
              <p className="text-neutral-600 dark:text-neutral-300 mb-4">{error}</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
                Please make sure you've configured your API key and customer ID in the config.ts file.
              </p>
            </div>
            <button
              onClick={refreshAll}
              className="w-full bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors shadow-sm"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show customer selector if no customer is loaded but we have customers list
  if (!customer && customers.length > 0) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-4 md:p-8 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">

          {/* Customer Selector */}
          <div className="max-w-2xl mx-auto bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-8 border border-neutral-200 dark:border-neutral-700">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Select a Customer</h2>
              <p className="text-neutral-500 dark:text-neutral-400 mb-6">
                Choose a customer from the list below to view their details and wallets.
              </p>
            </div>
            <div className="max-h-96 overflow-y-auto border-2 border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-900/50">
            {customers.map((cust) => (
              <button
                key={cust.id}
                onClick={() => handleCustomerChange(cust.id)}
                className="w-full px-4 py-3 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors border-b border-neutral-200 dark:border-neutral-700 last:border-b-0"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-neutral-900 dark:text-neutral-200 truncate">
                      {`${cust.email} 1(${cust.full_name})` || cust.full_name || 'Unnamed Customer'}
                    </div>
                    <div className="font-mono text-xs text-neutral-500 truncate">
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
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-4 md:p-4 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        {/* Header with Mock Toggle */}
        <div className="text-center mb-8">
            <div className="mt-4 max-w-3xl mx-auto relative">
              {customers.length > 0 && (
              <div className="relative w-full">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg px-4 py-3 flex items-center justify-between hover:border-amber-500 transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-3 flex-1 text-left">
                    <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Current Customer:</span>
                    {customer && (
                      <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-neutral-900 dark:text-neutral-200 truncate">
                            {customer.email}
                          </div>
                          <div className="font-mono text-xs text-neutral-500 truncate">
                            {customer.id}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 justify-end">
                          {customer.status && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(customer.status)}`}>
                              {customer.status.replace(/_/g, ' ').toUpperCase()}
                            </span>
                          )}
                          {customer.kyc_status && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(customer.kyc_status)}`}>
                              KYC: {customer.kyc_status.replace(/_/g, ' ').toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <svg
                    className={`w-5 h-5 ml-2 text-neutral-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute z-20 w-full mt-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl max-h-96 overflow-y-auto">
                    {customers.map((cust) => (
                      <button
                        key={cust.id}
                        onClick={() => handleCustomerChange(cust.id)}
                        className={`w-full px-4 py-3 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors border-b border-neutral-200 dark:border-neutral-700 last:border-b-0 ${
                          cust.id === currentCustomerId ? 'bg-amber-500/10' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-neutral-900 dark:text-neutral-200 truncate">
                              {`${cust.email} (${cust.full_name})` || cust.full_name || 'Unnamed Customer'}
                            </div>
                            <div className="font-mono text-xs text-neutral-500 truncate">
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

            <div className="mt-4 flex justify-center gap-4">
              <button
                onClick={() => setIsAddCustomerModalOpen(true)}
                className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-4 py-2 rounded-lg font-semibold hover:bg-amber-500/20 transition-all transform hover:scale-105 active:scale-95 shadow-sm inline-flex items-center gap-2 whitespace-nowrap"
              >
                <i className="fas fa-plus"></i> Add Customer
              </button>
              <button
                onClick={refreshAll}
                className="bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 px-4 py-2 rounded-lg font-semibold hover:bg-teal-500/20 transition-all transform hover:scale-105 active:scale-95 shadow-sm inline-flex items-center gap-2 whitespace-nowrap"
              >
                <i className="fas fa-sync-alt"></i> Refresh Data
              </button>
            </div>
          
        </div>

        {/* Customer Details */}
        {customer && <CustomerDetails customer={customer} />}

        {/* Wallets Section */}
        <WalletsSection 
          wallets={wallets} 
          virtualAccounts={virtualAccounts} 
          onAddWallet={() => setIsAddWalletModalOpen(true)} 
        />

        {/* Virtual Accounts Section */}
        <VirtualAccountsSection 
          virtualAccounts={virtualAccounts} 
          loading={virtualAccountsLoading} 
        />

        {/* Bank Accounts Section */}
        <BankAccountsSection 
          accounts={externalAccounts} 
          onAddBank={() => setIsAddBankModalOpen(true)} 
        />
      </div>

      {/* Add Bank Modal */}
      {customer && (
        <AddBankModal
          isOpen={isAddBankModalOpen}
          onClose={() => setIsAddBankModalOpen(false)}
          customerId={customer.id}
        />
      )}

      {/* Add Wallet Modal */}
      {customer && (
        <AddWalletModal
          isOpen={isAddWalletModalOpen}
          onClose={() => setIsAddWalletModalOpen(false)}
          customerId={customer.id}
          existingWallets={wallets}
        />
      )}

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={isAddCustomerModalOpen}
        onClose={() => setIsAddCustomerModalOpen(false)}
      />
    </div>
  )
}
