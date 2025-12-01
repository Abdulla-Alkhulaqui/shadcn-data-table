// Core Table Components
export { DataTable } from "./components/data-table/data-table";
export { BackendDataTable } from "./components/data-table/data-table-backend";
export { ApiDataTable } from "./components/data-table/api-data-table";

// Table Sub-components
export { DataTableColumnHeader } from "./components/data-table/data-table-column-header";
export { DataTableFacetedFilter } from "./components/data-table/data-table-faceted-filter";
export { DataTablePagination } from "./components/data-table/data-table-pagination";
export { DataTableToolbar } from "./components/data-table/data-table-toolbar";
export { DataTableViewOptions } from "./components/data-table/data-table-view-options";
export { DataTableRowActions } from "./components/data-table/data-table-row-actions";

// Component Props Types
export type { DataTableProps } from "./components/data-table/data-table";
export type { BackendDataTableProps } from "./components/data-table/data-table-backend";
export type { ApiDataTableProps } from "./components/data-table/api-data-table";
export type { FacetedFilterConfig } from "./components/data-table/data-table-toolbar";

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
  createActionsColumn,
  createNumberColumn,
  createBooleanColumn,
  createSelectionColumn,
} from "./lib/column-helpers";

// Configuration
export { dataTableConfig } from "./config/data-table";
export { flagConfig } from "./config/flag";

// Types
export type { DataTableConfig } from "./config/data-table";
export type { FlagConfig } from "./config/flag";
export type { DataTableRowAction, ExtendedColumnSort } from "./types/data-table";
export type { SearchParams } from "./types";
export type { 
  BackendTableMeta, 
  BackendTableResponse, 
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
