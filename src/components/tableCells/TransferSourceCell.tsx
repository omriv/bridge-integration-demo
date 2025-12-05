import { CopyableFieldCell } from './CopyableFieldCell';

export interface CellTypeProps {
  data?: Record<string, any>;
  onClick?: (value?: any) => void;
  className?: string;
  onCopy?: (text: string, fieldId: string) => void;
}

export function TransferSourceCell({ data, className, onCopy }: CellTypeProps) {
  const currency = data?.currency || '';
  const paymentRail = data?.paymentRail || '';
  const bridgeWalletId = data?.bridgeWalletId;
  const fromAddress = data?.fromAddress;
  const isOutgoing = data?.isOutgoing || false;
  const transferId = data?.transferId || '';
  const copiedField = data?.copiedField;

  return (
    <div className={className || (isOutgoing ? 'bg-red-50 border-l-2 border-red-400 pl-2 py-1' : '')}>
      <div className="space-y-1">
        <div className="font-medium text-gray-900">{currency.toUpperCase()}</div>
        <div className="text-gray-500 text-xs">{paymentRail}</div>
        {bridgeWalletId && (
          <CopyableFieldCell
            data={{
              label: "Wallet:",
              value: bridgeWalletId,
              fieldId: `src-wallet-${transferId}`,
              truncateLength: 8,
              copiedField
            }}
            onCopy={onCopy}
          />
        )}
        {fromAddress && (
          <CopyableFieldCell
            data={{
              label: "From:",
              value: fromAddress,
              fieldId: `src-from-${transferId}`,
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
