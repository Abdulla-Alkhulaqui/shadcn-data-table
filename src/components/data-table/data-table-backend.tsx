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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Skeleton } from "@/components/ui/skeleton";

import { DataTablePagination } from "./data-table-pagination";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";

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
   * receives the table instance so you can build custom toolbars.
   */
  renderToolbar?: (table: ReactTableInstance<TData>) => React.ReactNode;
  /**
   * Initial page size (defaults to 25)
   */
  initialPageSize?: number;
}

export function BackendDataTable<TData, TValue>({
  columns,
  data,
  totalCount,
  loading = false,
  onDataChange,
  renderToolbar,
  initialPageSize = 25,
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

  // Stable event handlers that don't change on re-renders
  const stableHandlers = React.useMemo(
    () => ({
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      onColumnVisibilityChange: setColumnVisibility,
      onPaginationChange: setPagination,
    }),
    []
  );

  // Stable table configuration - only recreate if columns change
  const stableTableOptions = React.useMemo(
    () => ({
      columns,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      manualPagination: true,
      manualSorting: true,
      manualFiltering: true,
      ...stableHandlers,
    }),
    [columns, stableHandlers]
  );

  // Create table instance with stable config
  const table = useReactTable({
    ...stableTableOptions,
    data, // This can change without recreating table
    pageCount: Math.ceil(totalCount / pagination.pageSize),
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      pagination,
    },
  });

  // Use ref to store latest onDataChange to avoid including it in dependencies
  const onDataChangeRef = React.useRef(onDataChange);
  onDataChangeRef.current = onDataChange;

  // Effect to trigger data fetching when table state changes
  React.useEffect(() => {
    if (onDataChangeRef.current) {
      onDataChangeRef.current({
        page: pagination.pageIndex + 1, // Convert to 1-based
        pageSize: pagination.pageSize,
        sorting,
        filters: columnFilters,
      });
    }
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
    columnFilters,
    // onDataChange removed from dependencies to prevent circular calls
  ]);

  // Get stable header groups - these shouldn't change unless columns change
  const headerGroups = table.getHeaderGroups();

  // Memoized table header that only changes when columns change
  const stableTableHeader = React.useMemo(() => {
    return (
      <TableHeader>
        {headerGroups.map((headerGroup) => (
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
    );
  }, [columns]);

  // Separate memoized component for just the table body content
  // This is the ONLY component that should re-render when data/loading changes
  const TableBodyContent = React.memo<{
    loading: boolean;
    rows: any[];
    columns: any[];
    pageSize: number;
  }>(
    ({ loading, rows, columns, pageSize }) => {
      if (loading) {
        return (
          <>
            {Array.from({ length: pageSize }, (_, index) => (
              <TableRow key={`skeleton-${index}`}>
                {columns.map((_, cellIndex) => (
                  <TableCell key={`skeleton-cell-${cellIndex}`}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </>
        );
      }

      if (rows?.length) {
        return (
          <>
            {rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell: any) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </>
        );
      }

      return (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-24 text-center">
            No results.
          </TableCell>
        </TableRow>
      );
    },
    (prevProps, nextProps) => {
      // Custom comparison: only re-render if loading state or actual row data changes
      return (
        prevProps.loading === nextProps.loading &&
        prevProps.rows === nextProps.rows &&
        prevProps.pageSize === nextProps.pageSize &&
        prevProps.columns.length === nextProps.columns.length
      );
    }
  );

  // Create stable pagination props to prevent unnecessary re-renders
  const paginationState = table.getState().pagination;
  const pageCount = table.getPageCount();

  // Memoized pagination that only updates when pagination actually changes
  const stablePagination = React.useMemo(() => {
    return <DataTablePagination table={table} totalCount={totalCount} />;
  }, [
    paginationState.pageIndex,
    paginationState.pageSize,
    pageCount,
    totalCount,
  ]);

  return (
    <div className="flex flex-col gap-4">
      {/* Render toolbar only if provided */}
      {renderToolbar && renderToolbar(table)}

      <div className="rounded-md border">
        <Table>
          {stableTableHeader}
          <TableBody>
            <TableBodyContent
              loading={loading}
              rows={table.getRowModel().rows}
              columns={columns}
              pageSize={pagination.pageSize}
            />
          </TableBody>
        </Table>
      </div>

      {stablePagination}
    </div>
  );
}
