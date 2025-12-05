export interface CellTypeProps {
  data?: Record<string, any>;
  onClick?: (value?: any) => void;
  className?: string;
  onCopy?: (text: string, fieldId: string) => void;
}

export function StateCell({ data, className }: CellTypeProps) {
  const state = data?.state || '';
  
  const getStateStyle = () => {
    if (state === 'payment_processed') return 'bg-green-100 text-green-800';
    if (state === 'awaiting_funds') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <span className={className || `inline-block px-2 py-0.5 rounded text-xs font-semibold ${getStateStyle()}`}>
      {state.replace(/_/g, ' ').toUpperCase()}
    </span>
  );
}
