export interface CellTypeProps {
  data?: Record<string, any>;
  onClick?: (value?: any) => void;
  className?: string;
  onCopy?: (text: string, fieldId: string) => void;
}

export function FeeCell({ data, className }: CellTypeProps) {
  const fee = data?.fee || '';
  
  return (
    <span className={className || "text-white"}>
      {fee}
    </span>
  );
}
