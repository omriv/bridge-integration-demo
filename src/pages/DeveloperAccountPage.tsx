import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

export function DeveloperAccountPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200">
      {/* Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Developer Account Overview</h1>
            <p className="text-neutral-500 dark:text-neutral-400">Manage your Bridge API settings</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-semibold">Back to Home</span>
          </button>
        </div>

        <div className="space-y-6">
          {/* Developer Fees Section */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg overflow-hidden border border-neutral-200 dark:border-neutral-700">
            <div className="w-full px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center">
                <span className="mr-3 p-1.5 bg-teal-500/10 rounded-lg text-teal-600 dark:text-teal-400"><i className="fas fa-coins"></i></span>
                Developer Fees
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 ml-11">View and manage your transaction fees</p>
            </div>
            <div className="p-6">
              <div className="bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-neutral-700 dark:text-neutral-300">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">Coming Soon:</span> Developer fee configuration and analytics will be available here.
                </p>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
                  <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Default Fee Rate</div>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-200">--%</div>
                </div>
                <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
                  <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Total Fees Collected</div>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-200">$--</div>
                </div>
                <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
                  <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Fee Transactions</div>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-200">--</div>
                </div>
              </div>
            </div>
          </div>

          {/* Exchange Rates Section */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg overflow-hidden border border-neutral-200 dark:border-neutral-700">
            <div className="w-full px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center">
                <span className="mr-3 p-1.5 bg-teal-500/10 rounded-lg text-teal-600 dark:text-teal-400"><i className="fas fa-exchange-alt"></i></span>
                Exchange Rates
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 ml-11">Current cryptocurrency exchange rates</p>
            </div>
            <div className="p-6">
              <div className="bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-neutral-700 dark:text-neutral-300">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">Coming Soon:</span> Real-time exchange rates and conversion tools will be available here.
                </p>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
                  <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">ETH/USD</div>
                  <div className="text-xl font-bold text-neutral-900 dark:text-neutral-200">$--</div>
                </div>
                <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
                  <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">BTC/USD</div>
                  <div className="text-xl font-bold text-neutral-900 dark:text-neutral-200">$--</div>
                </div>
                <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
                  <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">USDC/USD</div>
                  <div className="text-xl font-bold text-neutral-900 dark:text-neutral-200">$--</div>
                </div>
                <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
                  <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">USDT/USD</div>
                  <div className="text-xl font-bold text-neutral-900 dark:text-neutral-200">$--</div>
                </div>
              </div>
            </div>
          </div>

          {/* Webhooks Section */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg overflow-hidden border border-neutral-200 dark:border-neutral-700">
            <div className="w-full px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center">
                <span className="mr-3 p-1.5 bg-teal-500/10 rounded-lg text-teal-600 dark:text-teal-400"><i className="fas fa-bell"></i></span>
                Webhooks
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 ml-11">Configure event notifications and callbacks</p>
            </div>
            <div className="p-6">
              <div className="bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-neutral-700 dark:text-neutral-300">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">Coming Soon:</span> Webhook configuration and event monitoring will be available here.
                </p>
              </div>
              <div className="mt-4">
                <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Active Webhooks</div>
                    <span className="bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 px-3 py-1 rounded-full text-sm font-semibold">0</span>
                  </div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">No webhooks configured yet</div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50 border border-blue-500/20 text-neutral-900 dark:text-white rounded-lg p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="text-4xl text-blue-500 dark:text-blue-400">
                <i className="fas fa-info-circle"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-blue-600 dark:text-blue-400">Developer Account Features</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                  These sections are currently in development. They will provide comprehensive tools for managing your Bridge API integration, 
                  including fee analytics, real-time exchange rates, and webhook event monitoring. Check back soon for updates!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
