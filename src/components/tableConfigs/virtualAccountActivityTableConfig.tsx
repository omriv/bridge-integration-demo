import type { ColumnConfig } from '../DynamicTransactionsTable.types';
import type { VirtualAccountActivity } from '../../types';
import { TextCell } from '../tableCells/TextCell';
import { AmountCell } from '../tableCells/AmountCell';
import { CurrencyCell } from '../tableCells/CurrencyCell';
import { StateCell } from '../tableCells/StateCell';
import { CopyableFieldCell } from '../tableCells/CopyableFieldCell';
import { JsonButtonCell } from '../tableCells/JsonButtonCell';
import { DateTimeCell } from '../tableCells/DateTimeCell';

export function createVirtualAccountActivityTableColumns(
  copiedField: string | null,
  copyToClipboard: (text: string, fieldId: string) => void,
  openJsonModal: (title: string, data: unknown) => void
): ColumnConfig<VirtualAccountActivity>[] {
  return [
    {
      key: 'type',
      label: 'State',
      CellComponent: StateCell,
      getCellProps: (activity) => ({
        data: { state: activity.type }
      }),
      className: 'min-w-[150px]'
    },
    {
      key: 'deposit_id',
      label: 'Deposit ID',
      CellComponent: CopyableFieldCell,
      getCellProps: (activity) => ({
        data: {
          value: activity.deposit_id || '',
          fieldId: `deposit-${activity.id}`,
          copiedField,
          truncateLength: 12
        },
        onCopy: copyToClipboard
      }),
      className: 'min-w-[160px]'
    },
    {
      key: 'amount',
      label: 'Amount',
      CellComponent: AmountCell,
      getCellProps: (activity) => ({
        data: { amount: activity.amount }
      }),
      className: 'min-w-[80px]'
    },
    {
      key: 'developer_fee_amount',
      label: 'Developer Fee',
      CellComponent: AmountCell,
      getCellProps: (activity) => ({
        data: { amount: activity.developer_fee_amount }
      }),
      className: 'min-w-[80px]'
    },
    {
      key: 'currency',
      label: 'Currency',
      CellComponent: CurrencyCell,
      getCellProps: (activity) => ({
        data: { currency: activity.currency }
      }),
      className: 'min-w-[100px]'
    },
    {
      key: 'source_payment_rail',
      label: 'Source Payment Rail',
      CellComponent: TextCell,
      getCellProps: (activity) => ({
        data: { text: activity.source?.payment_rail?.toUpperCase() || 'N/A' }
      }),
      className: 'min-w-[120px]'
    },
    {
      key: 'destination_payment_rail',
      label: 'Dest Payment Rail',
      CellComponent: TextCell,
      getCellProps: (activity) => ({
        data: { text: activity.destination_payment_rail?.toUpperCase() || 'N/A' }
      }),
      className: 'min-w-[120px]'
    },
    {
      key: 'virtual_account_id',
      label: 'Virtual Account ID',
      CellComponent: CopyableFieldCell,
      getCellProps: (activity) => ({
        data: {
          value: activity.virtual_account_id || '',
          fieldId: `va-${activity.id}`,
          copiedField,
          truncateLength: 12
        },
        onCopy: copyToClipboard
      }),
      className: 'min-w-[160px]'
    },
    {
        key: 'created',
        label: 'Created',
        CellComponent: DateTimeCell,
        getCellProps: (activity) => ({
        data: { dateTime: activity.created_at }
        })
    },
    {
      key: 'json',
      label: 'Details',
      CellComponent: JsonButtonCell,
      getCellProps: (activity, index) => ({
        onClick: () => openJsonModal(`Virtual Account Activity #${index + 1}`, activity)
      }),
      className: 'min-w-[100px]'
    }
  ];
}
