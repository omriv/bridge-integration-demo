export interface CellTypeProps {
  data?: Record<string, any>;
  onClick?: (value?: any) => void;
  className?: string;
  onCopy?: (text: string, fieldId: string) => void;
}

export function PaymentSourceCell({ data, className }: CellTypeProps) {
  const currency = data?.currency || '';
  const paymentRail = data?.paymentRail || '';
  
  return (
    <div className={className}>
      <div className="font-medium text-neutral-900 dark:text-white">{currency.toUpperCase()}</div>
      <div className="text-neutral-500 text-xs">{paymentRail}</div>
    </div>
  );
}
