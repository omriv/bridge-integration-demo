export interface CellTypeProps {
  data?: Record<string, any>;
  onClick?: (value?: any) => void;
  className?: string;
  onCopy?: (text: string, fieldId: string) => void;
}

export function DateTimeCell({ data, className }: CellTypeProps) {
  const dateTime = data?.dateTime || '';
  const formatted = dateTime ? new Date(dateTime).toLocaleString() : '-';

  return (
    <span className={className || "text-slate-400 text-xs"}>
      {formatted}
    </span>
  );
}
