import type { CellTypeProps } from '../DynamicTransactionsTable.types';

export function PaymentRailCell({ data }: CellTypeProps) {
  const paymentRail = data?.paymentRail as string | undefined;

  if (!paymentRail) return <span className="text-gray-400 text-xs">N/A</span>;

  return (
    <span className="text-gray-700">
      {paymentRail}
    </span>
  );
}
