// Core Table Components
export { DataTable } from "./components/data-table/data-table";
export { BackendDataTable } from "./components/data-table/data-table-backend";
export { ApiDataTable } from "./components/data-table/api-data-table";

// Table Sub-components
export { DataTableColumnHeader } from "./components/data-table/data-table-column-header";
export { DataTableFacetedFilter } from "./components/data-table/data-table-faceted-filter";
export { DataTablePagination } from "./components/data-table/data-table-pagination";
export { DataTableToolbar } from "./components/data-table/data-table-toolbar";
export { DataTableAdvancedToolbar } from "./components/data-table/data-table-advanced-toolbar";
export { DataTableViewOptions } from "./components/data-table/data-table-view-options";
export { DataTableRowActions } from "./components/data-table/data-table-row-actions";
export { DataTableSkeleton } from "./components/data-table/data-table-skeleton";
export { DataTableFilterList } from "./components/data-table/data-table-filter-list";
export { DataTableFilterMenu } from "./components/data-table/data-table-filter-menu";
export { DataTableSortList } from "./components/data-table/data-table-sort-list";
export { DataTableDateFilter } from "./components/data-table/data-table-date-filter";
export { DataTableRangeFilter } from "./components/data-table/data-table-range-filter";
export { DataTableSliderFilter } from "./components/data-table/data-table-slider-filter";

// Component Props Types
export type { DataTableProps } from "./components/data-table/data-table";
export type { BackendDataTableProps } from "./components/data-table/data-table-backend";
export type {
  ApiDataTableProps,
} from "./components/data-table/api-data-table";
export type {
  DataTableToolbarProps,
} from "./components/data-table/data-table-toolbar";
export type { DataTablePaginationProps } from "./components/data-table/data-table-pagination";
export type { DataTableClasses } from "./components/data-table/data-table-types";

// Hooks
export { useDataTable } from "./hooks/use-data-table";
export { useBackendTable } from "./hooks/use-backend-table";
export { useDebouncedCallback } from "./hooks/use-debounced-callback";
export { useCallbackRef } from "./hooks/use-callback-ref";
export { useMediaQuery } from "./hooks/use-media-query";

// Utilities and Helpers
export { 
  DEFAULT_CLIENT_TABLE_CONFIG,
  DEFAULT_BACKEND_TABLE_CONFIG,
  DEFAULT_PAGINATION,
  createInitialTableState,
  TABLE_ROW_MODELS 
} from "./lib/table-helpers";
export { cn } from "./lib/utils";
export { PAGINATION, DEBOUNCE, TABLE, QUERY_KEYS, SEPARATORS } from "./lib/constants";
export { generateId } from "./lib/id";
export {
  getColumnPinningStyle,
  getFilterOperators,
  getDefaultFilterOperator,
  getValidFilters,
} from "./lib/data-table";
export { getSortingStateParser, getFiltersStateParser, parseAsStringArray } from "./lib/parsers";

// Parameter Transformers
export { 
  sortingTransformers, 
  filterTransformers, 
  presets 
} from "./lib/param-transformers";

// Column Helpers
export {
  createTextColumn,
  createStatusColumn,
  createDateColumn,
  createRowNumberColumn,
  createActionsColumn,
  createNumberColumn,
  createBooleanColumn,
  createMultiSelectColumn,
  createSelectionColumn,
} from "./lib/column-helpers";

// Configuration
export { dataTableConfig } from "./config/data-table";
export { flagConfig } from "./config/flag";

// Types
export type { DataTableConfig } from "./config/data-table";
export type { FlagConfig } from "./config/flag";
export type { DataTableRowAction, ExtendedColumnSort, ExtendedColumnFilter, FilterOperator, FilterVariant, JoinOperator, Option, QueryKeys } from "./types/data-table";
export type { FilterItemSchema } from "./lib/parsers";
export type { SearchParams } from "./types";
export type { 
  BackendTableMeta, 
  BackendTableResponse, 
  FlatBackendTableResponse,
  UseBackendTableParams, 
  UseBackendTableConfig 
} from "./hooks/use-backend-table";
export type { ActionConfig } from "./lib/column-helpers";

// TanStack Table Re-exports
export type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  RowSelectionState,
  PaginationState,
  Table as TanstackTable,
} from "@tanstack/react-table";

// Shell Component (if needed for layouts)
export { Shell } from "./components/shell";

// CSS Import
import "./index.css";
