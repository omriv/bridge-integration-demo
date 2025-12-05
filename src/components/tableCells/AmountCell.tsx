export interface CellTypeProps {
  data?: Record<string, any>;
  onClick?: (value?: any) => void;
  className?: string;
  onCopy?: (text: string, fieldId: string) => void;
}

export function AmountCell({ data, className }: CellTypeProps) {
  const amount = data?.amount || '';
  const currency = data?.currency;
  
  return (
    <span className={className || "font-semibold text-gray-900"}>
      {amount}{currency ? ` ${currency.toUpperCase()}` : ''}
    </span>
  );
}
