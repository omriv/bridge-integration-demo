export interface CellTypeProps {
  data?: Record<string, any>;
  onClick?: (value?: any) => void;
  className?: string;
  onCopy?: (text: string, fieldId: string) => void;
}

export function TruncatedAddressCell({ data, className }: CellTypeProps) {
  const address = data?.address || '';
  const truncateLength = data?.truncateLength || 10;
  const truncated = address.length > truncateLength 
    ? `${address.substring(0, truncateLength)}...` 
    : address;

  return (
    <span className={className || "text-xs font-mono text-slate-400"} title={address}>
      {truncated}
    </span>
  );
}
