import type { Transfer } from '../../types';
import type { ColumnConfig } from '../DynamicTransactionsTable.types';
import { IdCell } from '../tableCells/IdCell';
import { StateCell } from '../tableCells/StateCell';
import { AmountCell } from '../tableCells/AmountCell';
import { TransferSourceCell } from '../tableCells/TransferSourceCell';
import { TransferDirectionCell } from '../tableCells/TransferDirectionCell';
import { TransferDestinationCell } from '../tableCells/TransferDestinationCell';
import { FeeCell } from '../tableCells/FeeCell';
import { DateTimeCell } from '../tableCells/DateTimeCell';
import { JsonButtonCell } from '../tableCells/JsonButtonCell';

export function createTransfersTableColumns(
  walletId: string | undefined,
  walletAddress: string | undefined,
  copiedField: string | null,
  copyToClipboard: (text: string, fieldId: string) => void,
  openJsonModal: (title: string, data: unknown) => void
): ColumnConfig<Transfer>[] {
  return [
    {
      key: 'id',
      label: 'ID',
      CellComponent: IdCell,
      getCellProps: (transfer) => ({
        data: { id: transfer.id, truncateLength: 8 }
      })
    },
    {
      key: 'state',
      label: 'State',
      CellComponent: StateCell,
      getCellProps: (transfer) => ({
        data: { state: transfer.state }
      })
    },
    {
      key: 'amount',
      label: 'Amount',
      CellComponent: AmountCell,
      getCellProps: (transfer) => ({
        data: { amount: transfer.amount, currency: transfer.currency }
      })
    },
    {
      key: 'source',
      label: 'Source',
      CellComponent: TransferSourceCell,
      getCellProps: (transfer) => {
        const walletAddr = walletAddress?.toLowerCase();
        const isOutgoing = transfer.source.bridge_wallet_id === walletId || 
                          transfer.source.from_address?.toLowerCase() === walletAddr;
        return {
          data: {
            currency: transfer.source.currency,
            paymentRail: transfer.source.payment_rail,
            bridgeWalletId: transfer.source.bridge_wallet_id,
            fromAddress: transfer.source.from_address,
            isOutgoing,
            transferId: transfer.id,
            copiedField
          },
          onCopy: copyToClipboard
        };
      }
    },
    {
      key: 'direction',
      label: 'Type',
      CellComponent: TransferDirectionCell,
      getCellProps: (transfer) => {
        const walletAddr = walletAddress?.toLowerCase();
        const isOutgoing = transfer.source.bridge_wallet_id === walletId || 
                          transfer.source.from_address?.toLowerCase() === walletAddr;
        return {
          data: { isOutgoing }
        };
      }
    },
    {
      key: 'destination',
      label: 'Destination',
      CellComponent: TransferDestinationCell,
      getCellProps: (transfer) => {
        const walletAddr = walletAddress?.toLowerCase();
        const isOutgoing = transfer.source.bridge_wallet_id === walletId || 
                          transfer.source.from_address?.toLowerCase() === walletAddr;
        return {
          data: {
            currency: transfer.destination.currency,
            paymentRail: transfer.destination.payment_rail,
            toAddress: transfer.destination.to_address,
            isOutgoing,
            transferId: transfer.id,
            copiedField
          },
          onCopy: copyToClipboard
        };
      }
    },
    {
      key: 'fee',
      label: 'Fee',
      CellComponent: FeeCell,
      getCellProps: (transfer) => ({
        data: { fee: transfer.developer_fee }
      })
    },
    {
      key: 'created',
      label: 'Created',
      CellComponent: DateTimeCell,
      getCellProps: (transfer) => ({
        data: { dateTime: transfer.created_at }
      })
    },
    {
      key: 'actions',
      label: 'Actions',
      CellComponent: JsonButtonCell,
      getCellProps: (transfer) => ({
        data: { label: 'JSON', value: transfer },
        onClick: () => openJsonModal(`Transfer ${transfer.id.substring(0, 8)}`, transfer)
      })
    }
  ];
}
