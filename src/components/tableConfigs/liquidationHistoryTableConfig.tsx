import type { ColumnConfig } from '../DynamicTransactionsTable.types';
import type { LiquidationHistory } from '../../types';
import { IdCell } from '../tableCells/IdCell';
import { StateCell } from '../tableCells/StateCell';
import { AmountCell } from '../tableCells/AmountCell';
import { CurrencyCell } from '../tableCells/CurrencyCell';
import { PaymentRailCell } from '../tableCells/PaymentRailCell';
import { TruncatedAddressCell } from '../tableCells/TruncatedAddressCell';
import { TxHashCell } from '../tableCells/TxHashCell';
import { DateTimeCell } from '../tableCells/DateTimeCell';
import { JsonButtonCell } from '../tableCells/JsonButtonCell';

export function createLiquidationHistoryTableColumns(
  openJsonModal: (title: string, data: unknown) => void
): ColumnConfig<LiquidationHistory>[] {
  return [
    {
      key: 'id',
      label: 'ID',
      CellComponent: IdCell,
      getCellProps: (item) => ({
        data: {
          id: item.id,
          truncateLength: 8,
        },
      }),
    },
    {
      key: 'state',
      label: 'State',
      CellComponent: StateCell,
      getCellProps: (item) => ({
        data: {
          state: item.state,
        },
      }),
    },
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
      key: 'currency',
      label: 'Currency',
      CellComponent: CurrencyCell,
      getCellProps: (item) => ({
        data: {
          currency: item.currency,
        },
      }),
    },
    {
      key: 'source_payment_rail',
      label: 'Source Rail',
      CellComponent: PaymentRailCell,
      getCellProps: (item) => ({
        data: {
          paymentRail: item.source_payment_rail,
        },
      }),
    },
    {
      key: 'from_address',
      label: 'From Address',
      CellComponent: TruncatedAddressCell,
      getCellProps: (item) => ({
        data: {
          address: item.from_address,
          truncateLength: 12,
        },
      }),
    },
    {
      key: 'deposit_tx_hash',
      label: 'Deposit TX',
      CellComponent: TxHashCell,
      getCellProps: (item) => ({
        data: {
          txHash: item.deposit_tx_hash,
          truncateLength: 12,
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
      getCellProps: (item) => ({
        data: {
          label: 'JSON',
          value: item,
        },
        onClick: () => openJsonModal(`Liquidation ${item.id.substring(0, 8)}`, item),
      }),
    },
  ];
}
