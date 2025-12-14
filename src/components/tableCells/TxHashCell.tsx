import type { CellTypeProps } from '../DynamicTransactionsTable.types';

export function TxHashCell({ data }: CellTypeProps) {
  const txHash = data?.txHash as string | undefined;
  const truncateLength = (data?.truncateLength as number) ?? 12;

  if (!txHash) return <span className="text-slate-500 text-xs">N/A</span>;

  const truncated = txHash.length > truncateLength 
    ? `${txHash.substring(0, truncateLength)}...` 
    : txHash;

  return (
    <span className="text-xs font-mono text-slate-400" title={txHash}>
      {truncated}
    </span>
  );
}
