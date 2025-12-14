export interface CellTypeProps {
  data?: Record<string, any>;
  onClick?: (value?: any) => void;
  className?: string;
  onCopy?: (text: string, fieldId: string) => void;
}

export function IdCell({ data, className }: CellTypeProps) {
  const id = data?.id || '';
  const truncateLength = data?.truncateLength || 8;
  const truncated = id.length > truncateLength ? `${id.substring(0, truncateLength)}...` : id;

  return (
    <span className={className || "text-xs font-mono text-slate-400"} title={id}>
      {truncated}
    </span>
  );
}
