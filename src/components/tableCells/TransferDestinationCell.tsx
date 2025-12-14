import { CopyableFieldCell } from './CopyableFieldCell';

export interface CellTypeProps {
  data?: Record<string, any>;
  onClick?: (value?: any) => void;
  className?: string;
  onCopy?: (text: string, fieldId: string) => void;
}

export function TransferDestinationCell({ data, className, onCopy }: CellTypeProps) {
  const currency = data?.currency || '';
  const paymentRail = data?.paymentRail || '';
  const toAddress = data?.toAddress;
  const isOutgoing = data?.isOutgoing || false;
  const transferId = data?.transferId || '';
  const copiedField = data?.copiedField;

  return (
    <div className={className || (!isOutgoing ? 'bg-green-50 dark:bg-green-500/10 border-l-2 border-green-500/50 pl-2 py-1' : '')}>
      <div className="space-y-1">
        <div className="font-medium text-neutral-900 dark:text-white">{currency.toUpperCase()}</div>
        <div className="text-neutral-500 text-xs">{paymentRail}</div>
        {toAddress && (
          <CopyableFieldCell
            data={{
              label: "To:",
              value: toAddress,
              fieldId: `dest-to-${transferId}`,
              truncateLength: 10,
              copiedField
            }}
            onCopy={onCopy}
          />
        )}
      </div>
    </div>
  );
}
