import { useState, useMemo } from 'react';
import type { LiquidationAddress, Wallet } from '../types';
import { LiquidationAddressCard } from './LiquidationAddressCard';
import { AddLiquidationAddressModal } from './AddLiquidationAddressModal';

interface LiquidationAddressesSectionProps {
  liquidationAddresses: LiquidationAddress[];
  copiedField: string | null;
  onCopy: (text: string, fieldId: string) => void;
  onViewRawJson?: (item: LiquidationAddress) => void;
  customerId: string;
  wallets: Wallet[];
}

export function LiquidationAddressesSection({
  liquidationAddresses,
  copiedField,
  onCopy,
  onViewRawJson,
  customerId,
  wallets
}: LiquidationAddressesSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Process data for the flow chart
  const flowData = useMemo(() => {
    const sources = new Set<string>();
    const destinations = new Set<string>();
    const connections = new Set<string>();

    liquidationAddresses.forEach((la) => {
      const source = `${la.chain}|${la.currency}`;
      const dest = `${la.destination_payment_rail}|${la.destination_currency}`;
      sources.add(source);
      destinations.add(dest);
      connections.add(`${source}#${dest}`);
    });

    const sortedSources = Array.from(sources).sort();
    const sortedDestinations = Array.from(destinations).sort();

    const edges = Array.from(connections).map((conn) => {
      const [src, dst] = conn.split('#');
      return {
        source: src,
        dest: dst,
        sourceIndex: sortedSources.indexOf(src),
        destIndex: sortedDestinations.indexOf(dst),
      };
    });

    return { sources: sortedSources, destinations: sortedDestinations, edges };
  }, [liquidationAddresses]);

  const ITEM_HEIGHT = 32; // h-8
  const GAP = 16; // gap-4
  const ROW_HEIGHT = ITEM_HEIGHT + GAP;
  const containerHeight = Math.max(flowData.sources.length, flowData.destinations.length) * ROW_HEIGHT;

  const getHoverColorClass = (index: number) => {
    const colors = [
      'hover:stroke-blue-500',
      'hover:stroke-emerald-500',
      'hover:stroke-violet-500',
      'hover:stroke-amber-500',
      'hover:stroke-rose-500',
      'hover:stroke-lime-500',
      'hover:stroke-zinc-500',
      'hover:stroke-indigo-500',
      'hover:stroke-cyan-500'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center flex-1"
        >
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <span className="mr-2">🏦</span>
            Liquidation Addresses ({liquidationAddresses.length})
          </h2>
          <svg
            className={`w-5 h-5 text-gray-600 transition-transform ml-2 ${isCollapsed ? 'rotate-180' : ''}`}
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
            setIsAddModalOpen(true);
          }}
          className="ml-4 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Address
        </button>
      </div>

      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          {liquidationAddresses.length === 0 ? (
            <p className="text-gray-500 text-sm italic text-center py-4">
              No liquidation addresses found for this wallet
            </p>
          ) : (
            <div className="space-y-3">
              {/* Liquidation Flow Graph */}
              <div className="bg-gray-50 rounded p-4 border border-gray-200 overflow-hidden">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Liquidation Flows</h4>
                
                <div className="flex relative" style={{ height: containerHeight }}>
                  {/* Left Column: Sources */}
                  <div className="w-48 flex flex-col absolute left-0 top-0" style={{ gap: GAP }}>
                    {flowData.sources.map((source) => {
                      const [chain, currency] = source.split('|');
                      return (
                        <div key={source} className="h-8 flex items-center justify-end px-3 bg-teal-100 border border-gray-200 rounded-full shadow-sm">
                          <span className="text-xs font-bold text-gray-700">{chain.toUpperCase()}</span>
                          <span className="mx-1 text-gray-300">•</span>
                          <span className="text-xs text-gray-500">{currency.toUpperCase()}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Middle: SVG Connections */}
                  <div className="absolute left-48 right-48 top-0 bottom-0">
                    <svg 
                      width="100%" 
                      height="100%" 
                      viewBox={`0 0 100 ${containerHeight}`} 
                      preserveAspectRatio="none"
                      className="overflow-visible"
                    >
                      {flowData.edges.map((edge, i) => {
                        const y1 = edge.sourceIndex * ROW_HEIGHT + ITEM_HEIGHT / 2;
                        const y2 = edge.destIndex * ROW_HEIGHT + ITEM_HEIGHT / 2;
                        return (
                          <path
                            key={i}
                            d={`M 0 ${y1} C 50 ${y1}, 50 ${y2}, 100 ${y2}`}
                            fill="none"
                            stroke="#CBD5E1" // slate-300
                            strokeWidth="2"
                            vectorEffect="non-scaling-stroke"
                            className={`opacity-60 hover:opacity-100 transition-all duration-300 ${getHoverColorClass(i)}`}
                          />
                        );
                      })}
                    </svg>
                  </div>

                  {/* Right Column: Destinations */}
                  <div className="w-48 flex flex-col absolute right-0 top-0" style={{ gap: GAP }}>
                    {flowData.destinations.map((dest) => {
                      const [rail, currency] = dest.split('|');
                      return (
                        <div key={dest} className="h-8 flex items-center px-3 bg-amber-100 border border-gray-200 rounded-full shadow-sm">
                          <span className="text-xs font-bold text-gray-700">{rail.toUpperCase()}</span>
                          <span className="mx-1 text-gray-300">•</span>
                          <span className="text-xs text-gray-500">{currency.toUpperCase()}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Liquidation Address Cards */}
              {liquidationAddresses.map((la) => (
                <LiquidationAddressCard
                  key={la.id}
                  liquidationAddress={la}
                  copiedField={copiedField}
                  onCopy={onCopy}
                  onViewRawJson={onViewRawJson ? () => onViewRawJson(la) : undefined}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <AddLiquidationAddressModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        customerId={customerId}
        wallets={wallets}
      />
    </div>
  );
}
