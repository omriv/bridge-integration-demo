export interface CellTypeProps {
  data?: Record<string, any>;
  onClick?: (value?: any) => void;
  className?: string;
  onCopy?: (text: string, fieldId: string) => void;
}

export function PaymentDestinationCell({ data, className }: CellTypeProps) {
  const currency = data?.currency || '';
  const paymentRail = data?.paymentRail || '';
  
  return (
    <div className={className}>
      <div className="font-medium text-gray-900">{currency.toUpperCase()}</div>
      <div className="text-gray-500 text-xs">{paymentRail}</div>
    </div>
  );
}
