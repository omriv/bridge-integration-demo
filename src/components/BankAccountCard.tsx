import type { ExternalAccount } from '../types';

interface BankAccountCardProps {
  account: ExternalAccount;
}

export function BankAccountCard({ account }: BankAccountCardProps) {
  const getAccountDetails = () => {
    if (account.type === 'us_account') {
      return (
        <>
          <div className="flex justify-between">
            <span className="text-gray-500">Account Number:</span>
            <span className="font-mono font-medium">
              {account.account_number ? `****${account.account_number.slice(-4)}` : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Routing Number:</span>
            <span className="font-mono font-medium">{account.routing_number || 'N/A'}</span>
          </div>
        </>
      );
    } else if (account.type === 'iban') {
      return (
        <div className="flex justify-between">
          <span className="text-gray-500">IBAN:</span>
          <span className="font-mono font-medium truncate max-w-[200px]" title={account.iban}>
            {account.iban || 'N/A'}
          </span>
        </div>
      );
    } else {
      // Fallback for other types or generic display
      return (
        <>
          {account.account_number && (
            <div className="flex justify-between">
              <span className="text-gray-500">Account Number:</span>
              <span className="font-mono font-medium">
                {account.account_number.length > 4 ? `****${account.account_number.slice(-4)}` : account.account_number}
              </span>
            </div>
          )}
          {account.clabe && (
            <div className="flex justify-between">
              <span className="text-gray-500">CLABE:</span>
              <span className="font-mono font-medium">{account.clabe}</span>
            </div>
          )}
          {account.swift_code && (
            <div className="flex justify-between">
              <span className="text-gray-500">SWIFT:</span>
              <span className="font-mono font-medium">{account.swift_code}</span>
            </div>
          )}
        </>
      );
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏦</span>
          <div>
            <h3 className="font-semibold text-gray-800">{account.bank_name || 'Unknown Bank'}</h3>
            <p className="text-xs text-gray-500 uppercase">{account.type.replace(/_/g, ' ')}</p>
          </div>
        </div>
        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-semibold">
          {account.currency}
        </span>
      </div>
      
      <div className="space-y-2 text-sm border-t border-gray-100 pt-3">
        <div className="flex justify-between">
          <span className="text-gray-500">Account Owner:</span>
          <span className="font-medium">{account.account_owner_name || 'N/A'}</span>
        </div>
        {getAccountDetails()}
      </div>
    </div>
  );
}
