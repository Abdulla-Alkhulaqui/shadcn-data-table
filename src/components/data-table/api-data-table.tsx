"use client";

import * as React from "react";
import {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";

import { BackendDataTable } from "./data-table-backend";
import {
  useBackendTable,
  UseBackendTableConfig,
} from "../../hooks/use-backend-table";
import {
  createInitialTableState,
  DEFAULT_PAGINATION,
} from "../../lib/table-helpers";

export interface ApiDataTableProps<TData, TValue>
  extends Omit<UseBackendTableConfig<TData>, "initialData" | "initialMeta"> {
  /** Column definitions */
  columns: ColumnDef<TData, TValue>[];
  /** Optional toolbar renderer */
  renderToolbar?: (table: any, refetch?: () => void) => React.ReactNode;
  /** Initial page size */
  initialPageSize?: number;
  /** Initial data while loading */
  initialData?: TData[];
  /** Custom loading component */
  loadingComponent?: React.ReactNode;
  /** Custom error component */
  errorComponent?: (error: string, refetch: () => void) => React.ReactNode;
  /** Callback when data changes (for external state management) */
  onDataChange?: (data: { data: TData[]; meta: any }) => void;
  /** Callback to provide refetch function to parent component */
  onRefetchReady?: (refetch: () => void) => void;
}

/**
 * High-level API-connected data table component
 * Handles all backend communication automatically
 */
export function ApiDataTable<TData, TValue>({
  columns,
  endpoint,
  renderToolbar,
  initialPageSize = DEFAULT_PAGINATION.pageSize,
  initialData = [],
  loadingComponent,
  errorComponent,
  onDataChange,
  onRefetchReady,
  transformFilters,
  transformSorting,
  transformParams,
  fetchOptions,
  customFetch,
  enabled = true,
}: ApiDataTableProps<TData, TValue>) {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(initialPageSize);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [filters, setFilters] = React.useState<ColumnFiltersState>([]);

  const { data, meta, loading, error, refetch } = useBackendTable(
    { page, pageSize, sorting, filters },
    {
      endpoint,
      transformFilters,
      transformSorting,
      transformParams,
      fetchOptions,
      customFetch,
      enabled,
      initialData,
    }
  );

  // Notify parent of data changes
  React.useEffect(() => {
    if (onDataChange) {
      onDataChange({ data, meta });
    }
  }, [data, meta, onDataChange]);

  // Provide refetch function to parent
  React.useEffect(() => {
    if (onRefetchReady) {
      onRefetchReady(refetch);
    }
  }, [onRefetchReady, refetch]);

  // Handle data change from table
  const handleDataChange = React.useCallback(
    ({
      page: newPage,
      pageSize: newPageSize,
      sorting: newSorting,
      filters: newFilters,
    }: {
      page: number;
      pageSize: number;
      sorting: SortingState;
      filters: ColumnFiltersState;
    }) => {
      // Only update if values have actually changed to prevent infinite loops
      if (newPage !== page) setPage(newPage);
      if (newPageSize !== pageSize) setPageSize(newPageSize);
      if (JSON.stringify(newSorting) !== JSON.stringify(sorting)) setSorting(newSorting);
      if (JSON.stringify(newFilters) !== JSON.stringify(filters)) setFilters(newFilters);
    },
    [page, pageSize, sorting, filters]
  );

  // Custom error display
  if (error && errorComponent) {
    return <>{errorComponent(error, refetch)}</>;
  }

  // Default error display
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="text-red-500 mb-4">
          <h3 className="text-lg font-semibold">Error Loading Data</h3>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <BackendDataTable
      data={data}
      columns={columns}
      totalCount={meta.total}
      loading={loading}
      onDataChange={handleDataChange}
      renderToolbar={renderToolbar}
      initialPageSize={initialPageSize}
      refetch={refetch}
    />
  );
}
