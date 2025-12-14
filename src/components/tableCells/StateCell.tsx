export interface CellTypeProps {
  data?: Record<string, any>;
  onClick?: (value?: any) => void;
  className?: string;
  onCopy?: (text: string, fieldId: string) => void;
}

export function StateCell({ data, className }: CellTypeProps) {
  const state = data?.state || '';
  
  // If no state, show N/A
  if (!state) {
    return (
      <span className={className || "inline-block px-2 py-0.5 rounded text-xs font-semibold bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500"}>
        N/A
      </span>
    );
  }
  
  const getStateStyle = () => {
    const normalizedState = state.toLowerCase();
    
    // Success/Complete states
    if (normalizedState === 'payment_processed' || 
        normalizedState === 'funds_received' || 
        normalizedState === 'complete') {
      return 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400';
    }
    
    // In Progress states
    if (normalizedState === 'payment_submitted' || 
        normalizedState === 'funds_scheduled' || 
        normalizedState === 'awaiting_funds' ||
        normalizedState === 'in_review') {
      return 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400';
    }
    
    // Other/Unknown states
    return 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300';
  };

  return (
    <span className={className || `inline-block px-2 py-0.5 rounded text-xs font-semibold ${getStateStyle()}`}>
      {state.replace(/_/g, ' ').toUpperCase()}
    </span>
  );
}
