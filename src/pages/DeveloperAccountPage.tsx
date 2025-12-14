import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

export function DeveloperAccountPage() {
  const navigate = useNavigate();
  const { useMock } = useData();

  // Redirect to home if in mock mode
  if (useMock) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-3 py-1.5 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-semibold">Back to Home</span>
          </button>
          
          <div className="flex-1 mx-4 text-center">
            <h1 className="text-xl font-bold text-white">Developer Account Overview</h1>
            <p className="text-sm text-slate-400">Manage your Bridge API settings</p>
          </div>

          <div className="w-32"></div> {/* Spacer for balance */}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="space-y-6">
          {/* Developer Fees Section */}
          <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden border border-slate-700">
            <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-b border-green-500/20 text-white px-6 py-4">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-green-400">
                <span>💰</span>
                Developer Fees
              </h2>
              <p className="text-sm text-slate-400 mt-1">View and manage your transaction fees</p>
            </div>
            <div className="p-6">
              <div className="bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-slate-300">
                  <span className="font-semibold text-blue-400">Coming Soon:</span> Developer fee configuration and analytics will be available here.
                </p>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <div className="text-sm text-slate-500 mb-1">Default Fee Rate</div>
                  <div className="text-2xl font-bold text-slate-200">--%</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <div className="text-sm text-slate-500 mb-1">Total Fees Collected</div>
                  <div className="text-2xl font-bold text-slate-200">$--</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <div className="text-sm text-slate-500 mb-1">Fee Transactions</div>
                  <div className="text-2xl font-bold text-slate-200">--</div>
                </div>
              </div>
            </div>
          </div>

          {/* Exchange Rates Section */}
          <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden border border-slate-700">
            <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-b border-purple-500/20 text-white px-6 py-4">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-purple-400">
                <span>💱</span>
                Exchange Rates
              </h2>
              <p className="text-sm text-slate-400 mt-1">Current cryptocurrency exchange rates</p>
            </div>
            <div className="p-6">
              <div className="bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-slate-300">
                  <span className="font-semibold text-blue-400">Coming Soon:</span> Real-time exchange rates and conversion tools will be available here.
                </p>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <div className="text-sm text-slate-500 mb-1">ETH/USD</div>
                  <div className="text-xl font-bold text-slate-200">$--</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <div className="text-sm text-slate-500 mb-1">BTC/USD</div>
                  <div className="text-xl font-bold text-slate-200">$--</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <div className="text-sm text-slate-500 mb-1">USDC/USD</div>
                  <div className="text-xl font-bold text-slate-200">$--</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <div className="text-sm text-slate-500 mb-1">USDT/USD</div>
                  <div className="text-xl font-bold text-slate-200">$--</div>
                </div>
              </div>
            </div>
          </div>

          {/* Webhooks Section */}
          <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden border border-slate-700">
            <div className="bg-gradient-to-r from-orange-900/50 to-red-900/50 border-b border-orange-500/20 text-white px-6 py-4">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-orange-400">
                <span>🔔</span>
                Webhooks
              </h2>
              <p className="text-sm text-slate-400 mt-1">Configure event notifications and callbacks</p>
            </div>
            <div className="p-6">
              <div className="bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-slate-300">
                  <span className="font-semibold text-blue-400">Coming Soon:</span> Webhook configuration and event monitoring will be available here.
                </p>
              </div>
              <div className="mt-4">
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold text-slate-400">Active Webhooks</div>
                    <span className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-sm font-semibold">0</span>
                  </div>
                  <div className="text-sm text-slate-500">No webhooks configured yet</div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border border-blue-500/20 text-white rounded-lg p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="text-4xl">ℹ️</div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-blue-400">Developer Account Features</h3>
                <p className="text-sm text-slate-300">
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
