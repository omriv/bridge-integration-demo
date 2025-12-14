export interface CellTypeProps {
  data?: Record<string, any>;
  onClick?: (value?: any) => void;
  className?: string;
  onCopy?: (text: string, fieldId: string) => void;
}

export function TextCell({ data, className }: CellTypeProps) {
  const text = data?.text || '';
  
  return (
    <span className={className || "text-neutral-600 dark:text-neutral-300"}>
      {text}
    </span>
  );
}
