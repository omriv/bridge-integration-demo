import { useState } from 'react';
import type { DynamicTransactionsTableProps, ColumnConfig } from './DynamicTransactionsTable.types';

export type { CellTypeProps, ColumnConfig, DynamicTransactionsTableProps } from './DynamicTransactionsTable.types';

export function DynamicTransactionsTable<T>({
  title,
  icon = '📊',
  items,
  columns,
  onReload,
  isLoading = false,
  emptyMessage = 'No data found',
  onViewRawJson,
  initialCollapsed = true,
  collapsed,
  onCollapsedChange,
}: DynamicTransactionsTableProps<T>) {
  const [internalCollapsed, setInternalCollapsed] = useState(initialCollapsed);
  
  // Use controlled state if provided, otherwise use internal state
  const isCollapsed = collapsed !== undefined ? collapsed : internalCollapsed;
  const setIsCollapsed = onCollapsedChange || setInternalCollapsed;
  const [isReloading, setIsReloading] = useState(false);

  const handleReload = async () => {
    if (!onReload || isReloading) return;
    
    setIsReloading(true);
    try {
      await onReload();
    } finally {
      setIsReloading(false);
    }
  };

  const renderCell = (column: ColumnConfig<T>, item: T, index: number) => {
    const { CellComponent, getCellProps } = column;
    const props = getCellProps(item, index);
    return <CellComponent {...props} />;
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow border border-neutral-200 dark:border-neutral-700">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-neutral-200 dark:border-neutral-700">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-1"
        >
          <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center">
            <span className="mr-1.5">{icon}</span>
            {title} ({items.length})
          </h3>
          <svg
            className={`w-4 h-4 text-neutral-500 dark:text-neutral-400 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <div className="flex items-center gap-2">
          {onReload && (
            <button
              onClick={handleReload}
              disabled={isReloading}
              className="p-1 text-neutral-500 dark:text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Reload data"
            >
              <svg 
                className={`w-4 h-4 ${isReloading ? 'animate-spin' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
          
          {onViewRawJson && items.length > 0 && (
            <button
              onClick={onViewRawJson}
              className="px-2 py-1 bg-neutral-100 dark:bg-neutral-900 text-green-700 dark:text-green-400 rounded text-xs font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700"
            >
              View Full JSON
            </button>
          )}
        </div>
      </div>

      {/* Content with collapse animation */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isCollapsed ? 'max-h-0' : 'max-h-[9999px]'
        }`}
      >
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
              <span className="ml-3 text-neutral-500 dark:text-neutral-400">Loading...</span>
            </div>
          ) : items.length === 0 ? (
            <p className="text-neutral-500 text-sm italic text-center py-4">{emptyMessage}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-sm">
                <thead className="bg-neutral-50 dark:bg-neutral-700/50">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        className={`px-3 py-3 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 ${column.className || ''}`}
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                  {items.map((item, index) => (
                    <tr key={(item as any).id || index} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30">
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={`px-3 py-3 ${column.className || ''}`}
                        >
                          {renderCell(column, item, index)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
