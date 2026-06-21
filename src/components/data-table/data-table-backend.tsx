"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  Table as ReactTableInstance,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";

import { DEFAULT_BACKEND_TABLE_CONFIG } from "@/lib/table-helpers";
import { cn } from "@/lib/utils";

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
import type { DataTableClasses } from "./data-table-types";
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
  classes?: DataTableClasses<TData>;
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
  classes,
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

  const handleSortingChange = React.useCallback(
    (updater: React.SetStateAction<SortingState>) => {
      setSorting(updater);
      setPagination((current) => ({ ...current, pageIndex: 0 }));
    },
    []
  );

  const handleColumnFiltersChange = React.useCallback(
    (updater: React.SetStateAction<ColumnFiltersState>) => {
      setColumnFilters(updater);
      setPagination((current) => ({ ...current, pageIndex: 0 }));
    },
    []
  );

  const table = useReactTable<TData>({
    data,
    columns,
    pageCount: Math.max(Math.ceil(totalCount / Math.max(pagination.pageSize, 1)), 1),
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: handleColumnFiltersChange,
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

  const onDataChangeRef = React.useRef(onDataChange);
  onDataChangeRef.current = onDataChange;

  React.useEffect(() => {
    if (onDataChangeRef.current) {
      const newParams = {
        page: pagination.pageIndex + 1, // Convert to 1-based
        pageSize: pagination.pageSize,
        sorting,
        filters: columnFilters,
      };

      const prev = prevParams.current;
      if (
        prev.page !== newParams.page ||
        prev.pageSize !== newParams.pageSize ||
        prev.sorting !== newParams.sorting ||
        JSON.stringify(prev.filters) !== JSON.stringify(newParams.filters)
      ) {
        prevParams.current = newParams;
        onDataChangeRef.current(newParams);
      }
    }
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
    columnFilters,
  ]);

  return (
    <div className={cn("flex flex-col gap-4", classes?.root)}>
      {/* Render toolbar only if provided - always render regardless of loading state */}
      {renderToolbar ? (
        <div className={classes?.toolbar}>{renderToolbar(table, refetch)}</div>
      ) : null}

      <div className={cn("rounded-md border", classes?.tableWrapper)}>
        <Table className={classes?.table}>
          <TableHeader className={classes?.header}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className={classes?.headerRow}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={classes?.headerCell}
                  >
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
          <TableBody className={classes?.body}>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    loading ? "opacity-50" : "",
                    typeof classes?.row === "function"
                      ? classes.row(row)
                      : classes?.row
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        typeof classes?.cell === "function"
                          ? classes.cell(cell)
                          : classes?.cell
                      )}
                    >
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
                <TableRow key={`skeleton-${pagination.pageIndex}-${pagination.pageSize}-${index}`} className={classes?.emptyRow}>
                  {columns.map((_, cellIndex) => (
                    <TableCell
                      key={`skeleton-cell-${cellIndex}`}
                      className={classes?.emptyCell}
                    >
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className={classes?.emptyRow}>
                <TableCell
                  colSpan={columns.length}
                  className={cn("h-24 text-center", classes?.emptyCell)}
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        table={table}
        className={classes?.pagination}
      />
    </div>
  );
}
