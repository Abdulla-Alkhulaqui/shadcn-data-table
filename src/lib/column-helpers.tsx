import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../components/data-table/data-table-column-header";
import { DataTableRowActions } from "../components/data-table/data-table-row-actions";

/**
 * Common column helper functions to reduce boilerplate
 */

export interface ActionConfig {
  label: string;
  onClick: (row: any) => void;
  icon?: any;
  variant?: "default" | "destructive";
  shortcut?: string;
}

/**
 * Create a row number column. Backend/API tables provide an absolute offset
 * automatically; other tables fall back to visible-page numbering.
 */
export function createRowNumberColumn<TData>(
  options?: {
    header?: string;
    id?: string;
    startAt?: number;
    size?: number;
    className?: string;
  }
): ColumnDef<TData> {
  const {
    header = "#",
    id = "row_number",
    startAt = 1,
    size = 48,
    className = "text-sm font-medium text-muted-foreground",
  } = options || {};

  return {
    id,
    header,
    size,
    enableSorting: false,
    enableHiding: false,
    cell: ({ row, table }) => {
      const offset = table.options.meta?.rowNumberOffset ?? 0;
      return (
        <span className={className}>{offset + row.index + startAt}</span>
      );
    },
  };
}

/**
 * Create a standard text column with sorting and filtering
 */
export function createTextColumn<TData>(
  accessorKey: string,
  title: string,
  options?: {
    enableSorting?: boolean;
    enableColumnFilter?: boolean;
    enableHiding?: boolean;
    cell?: (value: any, row?: any) => React.ReactNode;
  }
): ColumnDef<TData> {
  const { enableSorting = true, enableColumnFilter = false, enableHiding = true, cell } = options || {};
  
  return {
    accessorKey,
    header: enableSorting 
      ? ({ column }) => <DataTableColumnHeader column={column} label={title} />
      : title,
    enableSorting,
    enableColumnFilter,
    enableHiding,
    cell: cell ? ({ getValue, row }) => cell(getValue(), row) : undefined,
  };
}

/**
 * Create a status column with icon support (like the existing task/transaction patterns)
 */
export function createStatusColumn<TData>(
  accessorKey: string,
  title: string,
  options?: {
    options?: Array<{ 
      value: string; 
      label: string; 
      icon?: any;
    }>;
    containerClass?: string;
  }
): ColumnDef<TData> {
  const { options: statusOptions = [], containerClass = "" } = options || {};

  return {
    accessorKey,
    header: ({ column }) => <DataTableColumnHeader column={column} label={title} />,
    cell: ({ getValue }) => {
      const value = getValue() as string;
      const status = statusOptions.find((option) => option.value === value);

      if (!status) {
        return null;
      }

      return (
        <div className={`flex items-center gap-2 ${containerClass}`}>
          {status.icon && (
            <status.icon className="text-muted-foreground size-4" />
          )}
          <span>{status.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  };
}

/**
 * Create a date column with formatted display
 */
export function createDateColumn<TData>(
  accessorKey: string,
  title: string,
  options?: {
    format?: "date" | "datetime" | "time" | "relative";
    enableSorting?: boolean;
  }
): ColumnDef<TData> {
  const { format = "date", enableSorting = true } = options || {};

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    
    switch (format) {
      case "datetime":
        return date.toLocaleString();
      case "time":
        return date.toLocaleTimeString();
      case "relative":
        return new Intl.RelativeTimeFormat().format(
          Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
          "day"
        );
      default:
        return date.toLocaleDateString();
    }
  };

  return {
    accessorKey,
    header: enableSorting 
      ? ({ column }) => <DataTableColumnHeader column={column} label={title} />
      : title,
    cell: ({ getValue }) => formatDate(getValue() as string),
    enableSorting,
  };
}

/**
 * Create an actions column with dropdown menu
 */
export function createActionsColumn<TData>(
  actions: ActionConfig[],
  options?: {
    header?: string;
    size?: number;
  }
): ColumnDef<TData> {
  const { header = "Actions", size = 40 } = options || {};

  return {
    id: "actions",
    header,
    size,
    cell: ({ row }) => (
      <DataTableRowActions 
        row={row}
        actions={actions}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  };
}

/**
 * Create a number column with formatting
 */
export function createNumberColumn<TData>(
  accessorKey: string,
  title: string,
  options?: {
    format?: "currency" | "percentage" | "decimal";
    currency?: string;
    decimals?: number;
    enableSorting?: boolean;
    cell?: (value: number, row?: any) => React.ReactNode;
  }
): ColumnDef<TData> {
  const { 
    format = "decimal", 
    currency = "USD", 
    decimals = 2, 
    enableSorting = true,
    cell
  } = options || {};

  const formatNumber = (value: number) => {
    if (value == null) return "";
    
    switch (format) {
      case "currency":
        return new Intl.NumberFormat(undefined, {
          style: "currency",
          currency,
          minimumFractionDigits: decimals,
        }).format(value);
      case "percentage":
        return new Intl.NumberFormat(undefined, {
          style: "percent",
          minimumFractionDigits: decimals,
        }).format(value / 100);
      default:
        return new Intl.NumberFormat(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(value);
    }
  };

  return {
    accessorKey,
    header: enableSorting 
      ? ({ column }) => <DataTableColumnHeader column={column} label={title} />
      : title,
    cell: cell 
      ? ({ getValue, row }) => cell(getValue() as number, row)
      : ({ getValue }) => formatNumber(getValue() as number),
    enableSorting,
  };
}

/**
 * Create a boolean column with yes/no display
 */
export function createBooleanColumn<TData>(
  accessorKey: string,
  title: string,
  options?: {
    trueLabel?: string;
    falseLabel?: string;
    enableSorting?: boolean;
  }
): ColumnDef<TData> {
  const { 
    trueLabel = "Yes", 
    falseLabel = "No", 
    enableSorting = true 
  } = options || {};

  return {
    accessorKey,
    header: enableSorting 
      ? ({ column }) => <DataTableColumnHeader column={column} label={title} />
      : title,
    cell: ({ getValue }) => {
      const value = getValue() as boolean;
      return (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          value 
            ? "bg-green-100 text-green-800" 
            : "bg-red-100 text-red-800"
        }`}>
          {value ? trueLabel : falseLabel}
        </span>
      );
    },
    enableSorting,
    enableColumnFilter: true,
    meta: {
      options: [
        { value: "true", label: trueLabel },
        { value: "false", label: falseLabel },
      ],
    },
  };
}

/**
 * Create a multi-select column with options
 */
export function createMultiSelectColumn<TData>(
  accessorKey: string,
  title: string,
  options: Array<{
    value: string;
    label: string;
    icon?: any;
  }>,
  options2?: {
    enableSorting?: boolean;
    enableHiding?: boolean;
  }
): ColumnDef<TData> {
  const { enableSorting = true, enableHiding = true } = options2 || {};

  return {
    accessorKey,
    header: ({ column }) => <DataTableColumnHeader column={column} label={title} />,
    cell: ({ getValue }) => {
      const value = getValue() as string | string[];
      const values = Array.isArray(value) ? value : [value];
      const selected = options.filter((opt) => values.includes(opt.value));

      return (
        <div className="flex items-center gap-1.5">
          {selected.length === 0 ? (
            <span className="text-muted-foreground">—</span>
          ) : selected.length > 2 ? (
            <span className="text-muted-foreground text-xs">
              {selected.length} selected
            </span>
          ) : (
            selected.map((opt) => (
              <span
                key={opt.value}
                className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-medium"
              >
                {opt.icon && <opt.icon className="size-3" />}
                {opt.label}
              </span>
            ))
          )}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const cellValue = row.getValue(id) as string | string[];
      const cellValues = Array.isArray(cellValue) ? cellValue : [cellValue];
      const filterValues = Array.isArray(value) ? value : [value];
      return filterValues.some((v: string) => cellValues.includes(v));
    },
    enableSorting,
    enableColumnFilter: true,
    enableHiding,
    meta: {
      variant: "multiSelect",
      options,
      label: title,
    },
  };
}

/**
 * Create a selection checkbox column
 */
export function createSelectionColumn<TData>(): ColumnDef<TData> {
  return {
    id: "select",
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
        className="rounded border-gray-300"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={(e) => row.toggleSelected(e.target.checked)}
        className="rounded border-gray-300"
      />
    ),
    size: 40,
    enableSorting: false,
    enableHiding: false,
  };
}
