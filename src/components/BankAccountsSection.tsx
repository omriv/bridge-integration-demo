import { useState } from 'react';
import type { ExternalAccount } from '../types';
import { BankAccountCard } from './BankAccountCard';

interface BankAccountsSectionProps {
  accounts: ExternalAccount[];
  onAddBank: () => void;
}

export function BankAccountsSection({ accounts, onAddBank }: BankAccountsSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className="mb-6 bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden border border-neutral-200 dark:border-neutral-700">
      <div className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center flex-1"
        >
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center">
            <span className="mr-3 p-1.5 bg-teal-500/10 rounded-lg text-teal-600 dark:text-teal-400">
              <i className="fas fa-landmark"></i>
            </span>
            Bank Accounts ({accounts.length})
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
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddBank();
          }}
          className="ml-4 inline-flex items-center px-3 py-1.5 border border-amber-500/20 text-xs font-medium rounded-lg text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
        >
          Add Bank
        </button>
      </div>

      {!isCollapsed && (
        <div className="p-6 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/30">
          {accounts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-neutral-400 text-5xl mb-4"><i className="fas fa-inbox"></i></div>
              <p className="text-neutral-500">No bank accounts found for this customer</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {accounts.map((account) => (
                <BankAccountCard key={account.id} account={account} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
