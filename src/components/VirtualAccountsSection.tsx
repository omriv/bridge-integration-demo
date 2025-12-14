import { useState } from 'react';
import type { VirtualAccount } from '../types';
import { VirtualAccountCard } from './VirtualAccountCard';

interface VirtualAccountsSectionProps {
  virtualAccounts: VirtualAccount[];
  loading?: boolean;
}

export function VirtualAccountsSection({ virtualAccounts, loading = false }: VirtualAccountsSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 mb-6">
      <div className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center flex-1"
        >
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
            <span className="mr-3 p-1.5 bg-teal-500/10 rounded-lg text-teal-600 dark:text-teal-400">
              <i className="fas fa-university"></i>
            </span>
            Virtual Accounts ({virtualAccounts.length})
          </h2>
          <svg
            className={`w-5 h-5 text-neutral-500 dark:text-neutral-400 transition-transform ml-3 ${isCollapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {!isCollapsed && (
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/30">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
              <p className="text-neutral-500">Loading virtual accounts...</p>
            </div>
          ) : virtualAccounts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-neutral-400 text-5xl mb-4"><i className="fas fa-inbox"></i></div>
              <p className="text-neutral-500">No virtual accounts found for this customer</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {virtualAccounts.map((account) => (
                <VirtualAccountCard key={account.id} virtualAccount={account} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
