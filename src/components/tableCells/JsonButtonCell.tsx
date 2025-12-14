export interface CellTypeProps {
  data?: Record<string, any>;
  onClick?: (value?: any) => void;
  className?: string;
  onCopy?: (text: string, fieldId: string) => void;
}

export function JsonButtonCell({ data, onClick, className }: CellTypeProps) {
  const label = data?.label || "JSON";
  
  return (
    <button
      onClick={() => onClick?.(data?.value)}
      className={className || "px-2 py-0.5 bg-neutral-100 text-green-700 rounded text-xs font-semibold hover:bg-neutral-200 border border-neutral-200 dark:bg-neutral-800 dark:text-green-400 dark:hover:bg-neutral-700 dark:border-neutral-700"}
    >
      {label}
    </button>
  );
}
