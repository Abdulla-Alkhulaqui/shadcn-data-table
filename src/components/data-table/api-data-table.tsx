"use client";

import * as React from "react";
import {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  Table as ReactTableInstance,
} from "@tanstack/react-table";

import { BackendDataTable } from "./data-table-backend";
import {
  DataTableToolbar,
} from "./data-table-toolbar";
import {
  useBackendTable,
  UseBackendTableConfig,
  BackendTableMeta,
} from "../../hooks/use-backend-table";
import { DEFAULT_PAGINATION } from "../../lib/table-helpers";
import type { DataTableClasses } from "./data-table-types";

export interface ApiDataTableProps<TData, TValue>
  extends Omit<UseBackendTableConfig<TData>, "initialData" | "initialMeta"> {
  columns: ColumnDef<TData, TValue>[];
  classes?: DataTableClasses<TData>;
  renderToolbar?: (
    table: ReactTableInstance<TData>,
    refetch?: () => void
  ) => React.ReactNode;
  initialPageSize?: number;
  initialData?: TData[];
  initialMeta?: BackendTableMeta;
  loadingComponent?: React.ReactNode;
  errorComponent?: (error: string, refetch: () => void) => React.ReactNode;
  onDataChange?: (data: { data: TData[]; meta: any }) => void;
  onRefetchReady?: (refetch: () => void) => void;
}

export function ApiDataTable<TData, TValue>({
  columns,
  classes,
  endpoint,
  renderToolbar,
  initialPageSize = DEFAULT_PAGINATION.pageSize,
  initialData = [],
  initialMeta,
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
  responseAdapter,
  loadingDelayMs,
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
      initialMeta,
      responseAdapter,
      loadingDelayMs,
    }
  );

  React.useEffect(() => {
    if (onDataChange) {
      onDataChange({ data, meta });
    }
  }, [data, meta, onDataChange]);

  React.useEffect(() => {
    if (onRefetchReady) {
      onRefetchReady(refetch);
    }
  }, [onRefetchReady, refetch]);

  const paramsRef = React.useRef({ page, pageSize, sorting, filters });
  paramsRef.current = { page, pageSize, sorting, filters };

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
      const prev = paramsRef.current;
      if (newPage !== prev.page) setPage(newPage);
      if (newPageSize !== prev.pageSize) setPageSize(newPageSize);
      if (JSON.stringify(newSorting) !== JSON.stringify(prev.sorting))
        setSorting(newSorting);
      if (JSON.stringify(newFilters) !== JSON.stringify(prev.filters))
        setFilters(newFilters);
    },
    [setPage, setPageSize, setSorting, setFilters]
  );

  if (error && errorComponent) {
    return <>{errorComponent(error, refetch)}</>;
  }

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

  if (loading && data.length === 0 && loadingComponent) {
    return <>{loadingComponent}</>;
  }

  const toolbarRenderer =
    renderToolbar ??
    ((table: ReactTableInstance<TData>) => (
      <DataTableToolbar table={table} />
    ));

  return (
    <BackendDataTable
      data={data}
      columns={columns}
      totalCount={meta.total}
      loading={loading}
      onDataChange={handleDataChange}
      renderToolbar={toolbarRenderer}
      initialPageSize={initialPageSize}
      refetch={refetch}
      classes={classes}
    />
  );
}
