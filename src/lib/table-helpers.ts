import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedMinMaxValues,
} from "@tanstack/react-table";

import { PAGINATION } from "./constants";

/**
 * Common table row model configurations
 */
export const TABLE_ROW_MODELS = {
  core: getCoreRowModel(),
  filtered: getFilteredRowModel(),
  pagination: getPaginationRowModel(),
  sorted: getSortedRowModel(),
  facetedRow: getFacetedRowModel(),
  facetedUniqueValues: getFacetedUniqueValues(),
  facetedMinMaxValues: getFacetedMinMaxValues(),
} as const;

/**
 * Default table state configuration for client-side tables
 */
export const DEFAULT_CLIENT_TABLE_CONFIG = {
  enableRowSelection: true,
  getCoreRowModel: TABLE_ROW_MODELS.core,
  getFilteredRowModel: TABLE_ROW_MODELS.filtered,
  getPaginationRowModel: TABLE_ROW_MODELS.pagination,
  getSortedRowModel: TABLE_ROW_MODELS.sorted,
  getFacetedRowModel: TABLE_ROW_MODELS.facetedRow,
  getFacetedUniqueValues: TABLE_ROW_MODELS.facetedUniqueValues,
} as const;

/**
 * Default table state configuration for backend/server-side tables
 */
export const DEFAULT_BACKEND_TABLE_CONFIG = {
  getCoreRowModel: TABLE_ROW_MODELS.core,
  getPaginationRowModel: TABLE_ROW_MODELS.pagination,
  manualPagination: true,
  manualSorting: true,
  manualFiltering: true,
} as const;

/**
 * Default pagination settings
 */
export const DEFAULT_PAGINATION = {
  pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
  pageIndex: PAGINATION.DEFAULT_PAGE_INDEX,
} as const;

/**
 * Common table state initialization
 */
export const createInitialTableState = (overrides?: Partial<any>) => ({
  pagination: DEFAULT_PAGINATION,
  rowSelection: {},
  columnVisibility: {},
  columnFilters: [],
  sorting: [],
  ...overrides,
});