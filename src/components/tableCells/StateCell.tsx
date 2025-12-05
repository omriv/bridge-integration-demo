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
      <span className={className || "inline-block px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-400"}>
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
      return 'bg-green-100 text-green-800';
    }
    
    // In Progress states
    if (normalizedState === 'payment_submitted' || 
        normalizedState === 'funds_scheduled' || 
        normalizedState === 'awaiting_funds' ||
        normalizedState === 'in_review') {
      return 'bg-yellow-100 text-yellow-800';
    }
    
    // Other/Unknown states
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <span className={className || `inline-block px-2 py-0.5 rounded text-xs font-semibold ${getStateStyle()}`}>
      {state.replace(/_/g, ' ').toUpperCase()}
    </span>
  );
}
