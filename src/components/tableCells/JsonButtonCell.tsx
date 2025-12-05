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
      className={className || "px-2 py-0.5 bg-gray-800 text-green-400 rounded text-xs font-semibold hover:bg-gray-700"}
    >
      {label}
    </button>
  );
}
