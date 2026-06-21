"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { SortingState, ColumnFiltersState } from "@tanstack/react-table";

const EMPTY_FETCH_OPTIONS: RequestInit = {};

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

export interface FlatBackendTableResponse<TData = any> {
  data: TData[];
  total: number;
  page?: number;
  perPage?: number;
  pageSize?: number;
  totalPages?: number;
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
  /** Adapt common API response shapes into the package's canonical shape */
  responseAdapter?:
    | "meta"
    | "flat"
    | ((response: unknown, params: UseBackendTableParams) => BackendTableResponse<TData>);
  /** Delay before setting loading=true, useful to avoid flicker */
  loadingDelayMs?: number;
}

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function normalizeResponse<TData>(
  response: unknown,
  params: UseBackendTableParams,
  adapter: UseBackendTableConfig<TData>["responseAdapter"],
): BackendTableResponse<TData> {
  if (typeof adapter === "function") {
    return adapter(response, params);
  }

  const record = toRecord(response);
  if (adapter === "flat") {
    const pageSize = Number(record.perPage ?? record.pageSize ?? params.pageSize);
    const total = Number(record.total ?? 0);
    return {
      data: Array.isArray(record.data) ? (record.data as TData[]) : [],
      meta: {
        page: Number(record.page ?? params.page),
        pageSize,
        total,
        totalPages: Number(
          record.totalPages ?? Math.ceil(total / Math.max(pageSize, 1)),
        ),
      },
    };
  }

  const meta = toRecord(record.meta);
  return {
    data: Array.isArray(record.data) ? (record.data as TData[]) : [],
    meta: {
      page: Number(meta.page ?? params.page),
      pageSize: Number(meta.pageSize ?? params.pageSize),
      total: Number(meta.total ?? 0),
      totalPages: Number(meta.totalPages ?? 0),
    },
  };
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
    fetchOptions = EMPTY_FETCH_OPTIONS,
    customFetch,
    enabled = true,
    initialData = [],
    initialMeta = {
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0,
    },
    responseAdapter = "meta",
    loadingDelayMs = 100,
  } = config;

  const [data, setData] = useState<TData[]>(initialData);
  const [meta, setMeta] = useState<BackendTableMeta>(initialMeta);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paramsRef = useRef(params);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const stableParams = useMemo(
    () => ({
      page: params.page,
      pageSize: params.pageSize,
      sorting: params.sorting,
      filters: params.filters,
    }),
    [params.page, params.pageSize, params.sorting, params.filters],
  );

  useEffect(() => {
    paramsRef.current = stableParams;
  }, [stableParams]);

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
    abortController?: AbortController,
    showLoading = true,
  ) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);

      const urlParams = buildParams(tableParams);
      const url = `${endpoint}?${urlParams.toString()}`;

      const response = customFetch 
        ? await customFetch(url, {
            ...fetchOptions,
            signal: fetchOptions.signal ?? abortController?.signal,
          })
        : await fetch(url, {
            ...fetchOptions,
            signal: fetchOptions.signal ?? abortController?.signal,
          });

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const rawResult = await response.json();
      const result = normalizeResponse<TData>(
        rawResult,
        tableParams,
        responseAdapter,
      );

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
  }, [endpoint, customFetch, fetchOptions, buildParams, responseAdapter]);

	// Effect for automatic data fetching
	useEffect(() => {
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
    }, loadingDelayMs);

    void fetchData(stableParams, abortController, false).finally(() => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    });

    return () => {
      abortController.abort();
      // Clean up loading timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, [stableParams, enabled, endpoint, fetchData, loadingDelayMs]);

  // Manual refetch function
  const refetch = useCallback(async () => {
    await fetchData(paramsRef.current);
  }, [fetchData]);

  return {
    data,
    meta,
    loading,
    error,
    refetch,
  };
}
