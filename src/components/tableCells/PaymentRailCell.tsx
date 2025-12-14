import type { CellTypeProps } from '../DynamicTransactionsTable.types';

export function PaymentRailCell({ data }: CellTypeProps) {
  const paymentRail = data?.paymentRail as string | undefined;

  if (!paymentRail) return <span className="text-neutral-500 text-xs">N/A</span>;

  return (
    <span className="text-neutral-600 dark:text-neutral-300">
      {paymentRail}
    </span>
  );
}
