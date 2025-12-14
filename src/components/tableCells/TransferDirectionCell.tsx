export interface CellTypeProps {
  data?: Record<string, any>;
  onClick?: (value?: any) => void;
  className?: string;
  onCopy?: (text: string, fieldId: string) => void;
}

export function TransferDirectionCell({ data, className }: CellTypeProps) {
  const isOutgoing = data?.isOutgoing || false;
  
  return (
    <span className={className || `inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
      isOutgoing 
        ? 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400' 
        : 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400'
    }`}>
      {isOutgoing ? (
        <>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
          OUT
        </>
      ) : (
        <>
          IN
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </>
      )}
    </span>
  );
}
