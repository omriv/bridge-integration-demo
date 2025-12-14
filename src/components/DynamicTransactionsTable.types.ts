import type { ComponentType, ReactNode } from 'react';

export interface CellTypeProps {
  data?: Record<string, any>;
  onClick?: (value?: any) => void;
  className?: string;
  onCopy?: (text: string, fieldId: string) => void;
}

// Column configuration interface
export interface ColumnConfig<T> {
  key: string;
  label: string;
  // The actual cell component to render
  CellComponent: ComponentType<CellTypeProps>;
  // Function to get props for the cell component
  getCellProps: (item: T, index: number) => CellTypeProps;
  // Optional: CSS classes for the column
  className?: string;
}

export interface DynamicTransactionsTableProps<T> {
  title: string;
  icon?: ReactNode;
  items: T[];
  columns: ColumnConfig<T>[];
  onReload?: () => void | Promise<void>;
  isLoading?: boolean;
  emptyMessage?: string;
  // Optional: Raw data for "View Full JSON" button
  rawData?: unknown;
  onViewRawJson?: () => void;
  // Initial collapsed state
  initialCollapsed?: boolean;
  // Controlled collapse state
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}
