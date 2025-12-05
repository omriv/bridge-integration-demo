import type { ColumnConfig } from '../DynamicTransactionsTable.types';
import type { VirtualAccountActivity } from '../../types';
import { TextCell } from '../tableCells/TextCell';
import { AmountCell } from '../tableCells/AmountCell';
import { CurrencyCell } from '../tableCells/CurrencyCell';
import { StateCell } from '../tableCells/StateCell';
import { CopyableFieldCell } from '../tableCells/CopyableFieldCell';
import { JsonButtonCell } from '../tableCells/JsonButtonCell';

export function createVirtualAccountActivityTableColumns(
  copiedField: string | null,
  copyToClipboard: (text: string, fieldId: string) => void,
  openJsonModal: (title: string, data: unknown) => void
): ColumnConfig<VirtualAccountActivity>[] {
  return [
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
      key: 'event_type',
      label: 'Type',
      CellComponent: StateCell,
      getCellProps: (activity) => ({
        data: { state: activity.event_type }
      }),
      className: 'min-w-[150px]'
    },
    {
      key: 'amount',
      label: 'Amount',
      CellComponent: AmountCell,
      getCellProps: (activity) => ({
        data: { amount: activity.amount }
      }),
      className: 'min-w-[120px]'
    },
    {
      key: 'developer_fee_amount',
      label: 'Developer Fee',
      CellComponent: AmountCell,
      getCellProps: (activity) => ({
        data: { amount: activity.developer_fee_amount }
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
      className: 'min-w-[200px]'
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
      className: 'min-w-[200px]'
    },
    {
      key: 'source_payment_rail',
      label: 'Source Payment Rail',
      CellComponent: TextCell,
      getCellProps: (activity) => ({
        data: { text: activity.source?.payment_rail?.toUpperCase() || 'N/A' }
      }),
      className: 'min-w-[140px]'
    },
    {
      key: 'destination_payment_rail',
      label: 'Dest Payment Rail',
      CellComponent: TextCell,
      getCellProps: (activity) => ({
        data: { text: activity.destination_payment_rail?.toUpperCase() || 'N/A' }
      }),
      className: 'min-w-[140px]'
    },
    {
      key: 'sender_name',
      label: 'Sender Name',
      CellComponent: TextCell,
      getCellProps: (activity) => ({
        data: { text: (activity as any).source?.sender_name || activity.sender_name || 'N/A' }
      }),
      className: 'min-w-[150px]'
    },
    {
      key: 'destination_tx_hash',
      label: 'Destination TX Hash',
      CellComponent: CopyableFieldCell,
      getCellProps: (activity) => ({
        data: {
          value: (activity as any).destination?.tx_hash || activity.destination_tx_hash || '',
          fieldId: `dest-tx-${activity.id}`,
          copiedField,
          truncateLength: 12
        },
        onCopy: copyToClipboard
      }),
      className: 'min-w-[180px]'
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
