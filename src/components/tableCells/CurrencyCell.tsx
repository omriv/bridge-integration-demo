export interface CellTypeProps {
  data?: Record<string, any>;
  onClick?: (value?: any) => void;
  className?: string;
  onCopy?: (text: string, fieldId: string) => void;
}

export function CurrencyCell({ data, className }: CellTypeProps) {
  const currency = data?.currency || '';
  
  return (
    <span className={className || "font-medium text-neutral-900 dark:text-white"}>
      {currency.toUpperCase()}
    </span>
  );
}
