import { useState } from 'react';
import type { LiquidationAddress } from '../types';
import { LiquidationAddressCard } from './LiquidationAddressCard';

interface LiquidationAddressesSectionProps {
  liquidationAddresses: LiquidationAddress[];
  copiedField: string | null;
  onCopy: (text: string, fieldId: string) => void;
}

export function LiquidationAddressesSection({
  liquidationAddresses,
  copiedField,
  onCopy,
}: LiquidationAddressesSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Get breakdown of chain+currency combinations
  const getChainCurrencyBreakdown = () => {
    const breakdown = new Map<string, number>();
    liquidationAddresses.forEach((la) => {
      const key = `${la.chain}+${la.currency}`;
      breakdown.set(key, (breakdown.get(key) || 0) + 1);
    });
    return Array.from(breakdown.entries()).map(([combo, count]) => ({ combo, count }));
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
      >
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <span className="mr-2">🏦</span>
          Liquidation Addresses ({liquidationAddresses.length})
        </h2>
        <svg
          className={`w-5 h-5 text-gray-600 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          {liquidationAddresses.length === 0 ? (
            <p className="text-gray-500 text-sm italic text-center py-4">
              No liquidation addresses found for this wallet
            </p>
          ) : (
            <div className="space-y-3">
              {/* Chain + Currency Breakdown */}
              <div className="bg-blue-50 rounded p-3 border border-blue-200">
                <h4 className="text-xs font-semibold text-blue-900 mb-2">Chain + Currency Combinations</h4>
                <div className="flex flex-wrap gap-2">
                  {getChainCurrencyBreakdown().map(({ combo, count }) => (
                    <span
                      key={combo}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold border border-blue-300"
                    >
                      {combo.toUpperCase()} ({count})
                    </span>
                  ))}
                </div>
              </div>

              {/* Liquidation Address Cards */}
              {liquidationAddresses.map((la) => (
                <LiquidationAddressCard
                  key={la.id}
                  liquidationAddress={la}
                  copiedField={copiedField}
                  onCopy={onCopy}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
