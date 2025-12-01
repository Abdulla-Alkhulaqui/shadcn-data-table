"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { SortingState, ColumnFiltersState } from "@tanstack/react-table";

export interface BackendTableMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface BackendTableResponse<TData = any> {
  data: TData[];
  meta: BackendTableMeta;
}

export interface UseBackendTableParams {
  page: number;
  pageSize: number;
  sorting: SortingState;
  filters: ColumnFiltersState;
}

export interface UseBackendTableConfig<TData = any> {
  /** The API endpoint to fetch data from */
  endpoint: string;
  /** Transform table filters to API parameters */
  transformFilters?: (filters: ColumnFiltersState) => Record<string, string>;
  /** Transform sorting to API parameters */
  transformSorting?: (sorting: SortingState) => Record<string, string>;
  /** Transform the entire params object before sending */
  transformParams?: (params: URLSearchParams) => URLSearchParams;
  /** Custom fetch options */
  fetchOptions?: RequestInit;
  /** Custom fetch function (overrides fetchOptions) */
  customFetch?: (url: string, options?: RequestInit) => Promise<Response>;
  /** Enable automatic refetch on params change */
  enabled?: boolean;
  /** Initial data */
  initialData?: TData[];
  /** Initial meta */
  initialMeta?: BackendTableMeta;
}

/**
 * Generic hook for backend table data fetching
 * Handles loading states, error handling, abort controllers, and refetching
 */
export function useBackendTable<TData = any>(
  params: UseBackendTableParams,
  config: UseBackendTableConfig<TData>
) {
  const {
    endpoint,
    transformFilters,
    transformSorting,
    transformParams,
    fetchOptions = {},
    customFetch,
    enabled = true,
    initialData = [],
    initialMeta = {
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0,
    }
  } = config;

  const [data, setData] = useState<TData[]>(initialData);
  const [meta, setMeta] = useState<BackendTableMeta>(initialMeta);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Create stable serialized versions of complex params to avoid infinite loops
  const paramsKey = useMemo(() => {
    return JSON.stringify({
      page: params.page,
      pageSize: params.pageSize,
      sorting: params.sorting,
      filters: params.filters
    });
  }, [params.page, params.pageSize, params.sorting, params.filters]);

  // Build URL parameters - memoized to prevent infinite loops
  const buildParams = useCallback((tableParams: UseBackendTableParams) => {
    const urlParams = new URLSearchParams({
      page: tableParams.page.toString(),
      perPage: tableParams.pageSize.toString(),
    });

    // Handle sorting
    if (tableParams.sorting.length > 0) {
      if (transformSorting) {
        const sortingParams = transformSorting(tableParams.sorting);
        Object.entries(sortingParams).forEach(([key, value]) => {
          urlParams.append(key, value);
        });
      } else {
        // Default sorting format: "field.direction"
        const sort = tableParams.sorting
          .map((s) => `${s.id}.${s.desc ? "desc" : "asc"}`)
          .join(",");
        urlParams.append("sort", sort);
      }
    }

    // Handle filters
    if (transformFilters) {
      const filterParams = transformFilters(tableParams.filters);
      Object.entries(filterParams).forEach(([key, value]) => {
        urlParams.append(key, value);
      });
    } else {
      // Default filter handling
      tableParams.filters.forEach((filter) => {
        if (filter.value) {
          if (Array.isArray(filter.value)) {
            urlParams.append(filter.id, filter.value.join(","));
          } else {
            urlParams.append(filter.id, filter.value as string);
          }
        }
      });
    }

    // Apply custom parameter transformation
    return transformParams ? transformParams(urlParams) : urlParams;
  }, [transformSorting, transformFilters, transformParams]);

  // Fetch data
  const fetchData = useCallback(async (
    tableParams: UseBackendTableParams,
    abortController?: AbortController
  ) => {
    try {
      setLoading(true);
      setError(null);

      const urlParams = buildParams(tableParams);
      const url = `${endpoint}?${urlParams.toString()}`;

      const response = customFetch 
        ? await customFetch(url, {
            signal: abortController?.signal,
            ...fetchOptions,
          })
        : await fetch(url, {
            signal: abortController?.signal,
            ...fetchOptions,
          });

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const result: BackendTableResponse<TData> = await response.json();

      // Only update if not aborted
      if (!abortController?.signal.aborted) {
        setData(result.data);
        setMeta(result.meta);
        setLoading(false);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      if (!abortController?.signal.aborted) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
        setLoading(false);
      }
      console.error("Backend table fetch error:", err);
    }
  }, [endpoint, customFetch, fetchOptions, buildParams]);

  // Effect for automatic data fetching
  useEffect(() => {
    // console.log('useBackendTable: Effect triggered', params, config);
    
    if (!enabled) return;

    const abortController = new AbortController();
    
    // Clear any existing loading timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }

    // Set loading after a small delay to prevent flicker on quick responses
    loadingTimeoutRef.current = setTimeout(() => {
      setLoading(true);
      loadingTimeoutRef.current = null;
    }, 100);

    // Inline fetch to avoid circular dependency
    const fetchDataInline = async () => {
      try {
        setError(null);

        const urlParams = new URLSearchParams({
          page: params.page.toString(),
          perPage: params.pageSize.toString(),
        });

        // Handle sorting
        if (params.sorting.length > 0) {
          if (transformSorting) {
            const sortingParams = transformSorting(params.sorting);
            Object.entries(sortingParams).forEach(([key, value]) => {
              urlParams.append(key, value);
            });
          } else {
            // Default sorting format: "field.direction"
            const sort = params.sorting
              .map((s) => `${s.id}.${s.desc ? "desc" : "asc"}`)
              .join(",");
            urlParams.append("sort", sort);
          }
        }

        // Handle filters
        if (transformFilters) {
          const filterParams = transformFilters(params.filters);
          Object.entries(filterParams).forEach(([key, value]) => {
            urlParams.append(key, value);
          });
        } else {
          // Default filter handling
          params.filters.forEach((filter) => {
            if (filter.value) {
              if (Array.isArray(filter.value)) {
                urlParams.append(filter.id, filter.value.join(","));
              } else {
                urlParams.append(filter.id, filter.value as string);
              }
            }
          });
        }

        // Apply custom parameter transformation
        const finalParams = transformParams ? transformParams(urlParams) : urlParams;
        const url = `${endpoint}?${finalParams.toString()}`;

        const response = customFetch 
          ? await customFetch(url, {
              signal: abortController?.signal,
              ...fetchOptions,
            })
          : await fetch(url, {
              signal: abortController?.signal,
              ...fetchOptions,
            });

        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        const result: BackendTableResponse<TData> = await response.json();

        // Only update if not aborted
        if (!abortController?.signal.aborted) {
          // Clear loading timeout if still pending
          if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current);
            loadingTimeoutRef.current = null;
          }
          setData(result.data);
          setMeta(result.meta);
          setLoading(false);
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        if (!abortController?.signal.aborted) {
          // Clear loading timeout if still pending
          if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current);
            loadingTimeoutRef.current = null;
          }
          setError(err instanceof Error ? err.message : "Failed to fetch data");
          setLoading(false);
        }
        console.error("Backend table fetch error:", err);
      }
    };

    fetchDataInline();

    return () => {
      abortController.abort();
      // Clean up loading timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, [paramsKey, enabled, endpoint]);

  // Manual refetch function
  const refetch = useCallback(async () => {
    await fetchData(params);
  }, [fetchData, params]);

  return {
    data,
    meta,
    loading,
    error,
    refetch,
  };
}