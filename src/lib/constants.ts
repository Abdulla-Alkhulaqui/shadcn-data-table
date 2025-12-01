/**
 * Common constants used throughout the data table package
 */

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 25,
  DEFAULT_PAGE_INDEX: 0,
  PAGE_SIZE_OPTIONS: [10, 20, 25, 30, 40, 50],
} as const;

export const DEBOUNCE = {
  DEFAULT_MS: 300,
  SEARCH_MS: 300,
  FILTER_MS: 50,
} as const;

export const TABLE = {
  EMPTY_MESSAGE: "No results.",
  LOADING_SKELETON_ROWS: 10,
} as const;

export const QUERY_KEYS = {
  PAGE: "page",
  PER_PAGE: "perPage", 
  SORT: "sort",
} as const;

export const SEPARATORS = {
  ARRAY: ",",
} as const;