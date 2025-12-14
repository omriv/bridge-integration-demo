export interface CellTypeProps {
  data?: Record<string, any>;
  onClick?: (value?: any) => void;
  className?: string;
  onCopy?: (text: string, fieldId: string) => void;
}

export function TextCell({ data, className }: CellTypeProps) {
  const text = data?.text || '';
  
  return (
    <span className={className || "text-slate-300"}>
      {text}
    </span>
  );
}
