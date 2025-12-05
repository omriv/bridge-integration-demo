export interface CellTypeProps {
  data?: Record<string, any>;
  onClick?: (value?: any) => void;
  className?: string;
  onCopy?: (text: string, fieldId: string) => void;
}

export function CopyableFieldCell({ data, className, onCopy }: CellTypeProps) {
  const label = data?.label || '';
  const value = data?.value || '';
  const fieldId = data?.fieldId || '';
  const truncateLength = data?.truncateLength || 10;
  const copiedField = data?.copiedField;
  
  // If no value, show N/A without copy button
  if (!value) {
    return (
      <div className={className || "flex items-center gap-1 text-xs"}>
        <span className="text-gray-500">{label}</span>
        <span className="text-gray-400">N/A</span>
      </div>
    );
  }
  
  const truncated = value.length > truncateLength 
    ? `${value.substring(0, truncateLength)}...` 
    : value;

  return (
    <div className={className || "flex items-center gap-1 text-xs"}>
      <span className="text-gray-500">{label}</span>
      <span className="font-mono text-gray-700" title={value}>
        {truncated}
      </span>
      <button
        onClick={() => onCopy?.(value, fieldId)}
        className="text-gray-400 hover:text-gray-600"
        title="Copy"
      >
        {copiedField === fieldId ? (
          <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>
    </div>
  );
}
