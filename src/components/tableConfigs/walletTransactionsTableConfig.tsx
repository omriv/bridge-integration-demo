import type { ColumnConfig } from '../DynamicTransactionsTable.types';
import type { WalletTransaction } from '../../types';
import { AmountCell } from '../tableCells/AmountCell';
import { PaymentSourceCell } from '../tableCells/PaymentSourceCell';
import { PaymentDestinationCell } from '../tableCells/PaymentDestinationCell';
import { FeeCell } from '../tableCells/FeeCell';
import { DateTimeCell } from '../tableCells/DateTimeCell';
import { JsonButtonCell } from '../tableCells/JsonButtonCell';

export function createWalletTransactionsTableColumns(
  openJsonModal: (title: string, data: unknown) => void
): ColumnConfig<WalletTransaction>[] {
  return [
    {
      key: 'amount',
      label: 'Amount',
      CellComponent: AmountCell,
      getCellProps: (item) => ({
        data: {
          amount: item.amount,
        },
      }),
    },
    {
      key: 'source',
      label: 'Source',
      CellComponent: PaymentSourceCell,
      getCellProps: (item) => ({
        data: {
          currency: item.source.currency,
          paymentRail: item.source.payment_rail,
        },
      }),
    },
    {
      key: 'destination',
      label: 'Destination',
      CellComponent: PaymentDestinationCell,
      getCellProps: (item) => ({
        data: {
          currency: item.destination.currency,
          paymentRail: item.destination.payment_rail,
        },
      }),
    },
    {
      key: 'fee',
      label: 'Fee',
      CellComponent: FeeCell,
      getCellProps: (item) => ({
        data: {
          fee: item.developer_fee,
        },
      }),
    },
    {
      key: 'created_at',
      label: 'Created',
      CellComponent: DateTimeCell,
      getCellProps: (item) => ({
        data: {
          dateTime: item.created_at,
        },
      }),
    },
    {
      key: 'actions',
      label: 'Actions',
      CellComponent: JsonButtonCell,
      getCellProps: (item, index) => ({
        data: {
          label: 'JSON',
          value: item,
        },
        onClick: () => openJsonModal(`Transaction #${(index ?? 0) + 1}`, item),
      }),
    },
  ];
}
