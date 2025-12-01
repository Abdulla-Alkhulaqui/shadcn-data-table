"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  Table as ReactTableInstance,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";

import {
  DEFAULT_BACKEND_TABLE_CONFIG,
  createInitialTableState,
} from "@/lib/table-helpers";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Skeleton } from "@/components/ui/skeleton";

import { DataTablePagination } from "./data-table-pagination";
import { useReactTable } from "@tanstack/react-table";

export interface BackendDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalCount: number;
  loading?: boolean;
  onDataChange?: (params: {
    page: number;
    pageSize: number;
    sorting: SortingState;
    filters: ColumnFiltersState;
  }) => void;
  /**
   * Optional toolbar renderer —
   * receives the table instance and optional refetch function so you can build custom toolbars.
   */
  renderToolbar?: (
    table: ReactTableInstance<TData>,
    refetch?: () => void
  ) => React.ReactNode;
  /**
   * Initial page size (defaults to 25)
   */
  initialPageSize?: number;
  /**
   * Optional refetch function to pass to the toolbar
   */
  refetch?: () => void;
}

export function BackendDataTable<TData, TValue>({
  columns,
  data,
  totalCount,
  loading = false,
  onDataChange,
  renderToolbar,
  initialPageSize = 25,
  refetch,
}: BackendDataTableProps<TData, TValue>) {
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: initialPageSize,
  });

  const table = useReactTable<TData>({
    data,
    columns,
    pageCount: Math.ceil(totalCount / pagination.pageSize),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      pagination,
    },
    ...DEFAULT_BACKEND_TABLE_CONFIG,
  });

  const prevParams = React.useRef({
    page: 1,
    pageSize: initialPageSize,
    sorting: [] as SortingState,
    filters: [] as ColumnFiltersState,
  });

  React.useEffect(() => {
    if (onDataChange) {
      const newParams = {
        page: pagination.pageIndex + 1, // Convert to 1-based
        pageSize: pagination.pageSize,
        sorting,
        filters: columnFilters,
      };

      // Only call onDataChange if the params have actually changed
      if (
        prevParams.current.page !== newParams.page ||
        prevParams.current.pageSize !== newParams.pageSize ||
        JSON.stringify(prevParams.current.sorting) !== JSON.stringify(newParams.sorting) ||
        JSON.stringify(prevParams.current.filters) !== JSON.stringify(newParams.filters)
      ) {
        prevParams.current = newParams;
        onDataChange(newParams);
      }
    }
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
    columnFilters,
    onDataChange,
  ]);

  return (
    <div className="flex flex-col gap-4">
      {/* Render toolbar only if provided - always render regardless of loading state */}
      {renderToolbar && renderToolbar(table, refetch)}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={loading ? "opacity-50" : ""}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : loading ? (
              Array.from({ length: pagination.pageSize }, (_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  {columns.map((_, cellIndex) => (
                    <TableCell key={`skeleton-cell-${cellIndex}`}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} totalCount={totalCount} />
    </div>
  );
}
