import { SortingState, ColumnFiltersState } from "@tanstack/react-table";

/**
 * Common parameter transformers for different backend API formats
 */

// Sorting transformers
export const sortingTransformers = {
  /**
   * Default: "field.direction" format
   * Example: "name.asc,created.desc"
   */
  dotNotation: (sorting: SortingState): Record<string, string> => {
    if (sorting.length === 0) return {};
    const sort = sorting
      .map((s) => `${s.id}.${s.desc ? "desc" : "asc"}`)
      .join(",");
    return { sort };
  },

  /**
   * Separate sort_by and sort_direction parameters
   * Example: sort_by=name&sort_direction=asc
   */
  separateParams: (sorting: SortingState): Record<string, string> => {
    if (sorting.length === 0) return {};
    const firstSort = sorting[0]; // Most APIs only support single column sorting
    return {
      sort_by: firstSort.id,
      sort_direction: firstSort.desc ? "desc" : "asc",
    };
  },

  /**
   * Array-based sorting
   * Example: sort[]=name:asc&sort[]=created:desc
   */
  arrayFormat: (sorting: SortingState): Record<string, string> => {
    const params: Record<string, string> = {};
    sorting.forEach((s, index) => {
      params[`sort[${index}]`] = `${s.id}:${s.desc ? "desc" : "asc"}`;
    });
    return params;
  },

  /**
   * GraphQL/Prisma style
   * Example: orderBy=name_ASC
   */
  orderBy: (sorting: SortingState): Record<string, string> => {
    if (sorting.length === 0) return {};
    const firstSort = sorting[0];
    return {
      orderBy: `${firstSort.id}_${firstSort.desc ? "DESC" : "ASC"}`,
    };
  },
};

// Filter transformers
export const filterTransformers = {
  /**
   * Default: use filter IDs as parameter names
   */
  direct: (filters: ColumnFiltersState): Record<string, string> => {
    const params: Record<string, string> = {};
    filters.forEach((filter) => {
      if (filter.value) {
        if (Array.isArray(filter.value)) {
          params[filter.id] = filter.value.join(",");
        } else {
          params[filter.id] = filter.value as string;
        }
      }
    });
    return params;
  },

  /**
   * Transform specific filter names to API parameter names
   */
  withMapping: (mapping: Record<string, string>) => 
    (filters: ColumnFiltersState): Record<string, string> => {
      const params: Record<string, string> = {};
      filters.forEach((filter) => {
        if (filter.value) {
          const paramName = mapping[filter.id] || filter.id;
          if (Array.isArray(filter.value)) {
            params[paramName] = filter.value.join(",");
          } else {
            params[paramName] = filter.value as string;
          }
        }
      });
      return params;
    },

  /**
   * Handle search specially (common pattern where "name" filter becomes "search")
   */
  withSearch: (searchField = "name", searchParam = "search") =>
    (filters: ColumnFiltersState): Record<string, string> => {
      const params: Record<string, string> = {};
      filters.forEach((filter) => {
        if (filter.value) {
          if (filter.id === searchField) {
            params[searchParam] = filter.value as string;
          } else if (Array.isArray(filter.value)) {
            params[filter.id] = filter.value.join(",");
          } else {
            params[filter.id] = filter.value as string;
          }
        }
      });
      return params;
    },

  /**
   * Prefix all filter parameters
   * Example: filter_name=John&filter_status=active
   */
  withPrefix: (prefix: string) =>
    (filters: ColumnFiltersState): Record<string, string> => {
      const params: Record<string, string> = {};
      filters.forEach((filter) => {
        if (filter.value) {
          const paramName = `${prefix}${filter.id}`;
          if (Array.isArray(filter.value)) {
            params[paramName] = filter.value.join(",");
          } else {
            params[paramName] = filter.value as string;
          }
        }
      });
      return params;
    },

  /**
   * JSON-encoded filters
   * Example: filters={"name":"John","status":["active","pending"]}
   */
  jsonEncoded: (filters: ColumnFiltersState): Record<string, string> => {
    if (filters.length === 0) return {};
    const filterObj: Record<string, any> = {};
    filters.forEach((filter) => {
      if (filter.value) {
        filterObj[filter.id] = filter.value;
      }
    });
    return { filters: JSON.stringify(filterObj) };
  },
};

/**
 * Common parameter transformation presets for popular backend frameworks
 */
export const presets = {
  /** Laravel/Eloquent style parameters */
  laravel: {
    transformSorting: sortingTransformers.separateParams,
    transformFilters: filterTransformers.direct,
  },

  /** Django REST framework style */
  django: {
    transformSorting: (sorting: SortingState): Record<string, string> => {
      if (sorting.length === 0) return {};
      const ordering = sorting
        .map((s) => (s.desc ? `-${s.id}` : s.id))
        .join(",");
      return { ordering };
    },
    transformFilters: filterTransformers.direct,
  },

  /** Strapi style */
  strapi: {
    transformSorting: (sorting: SortingState): Record<string, string> => {
      const params: Record<string, string> = {};
      sorting.forEach((s, index) => {
        params[`sort[${index}]`] = s.desc ? `${s.id}:desc` : `${s.id}:asc`;
      });
      return params;
    },
    transformFilters: filterTransformers.withPrefix("filters[") && 
      ((filters: ColumnFiltersState): Record<string, string> => {
        const params: Record<string, string> = {};
        filters.forEach((filter) => {
          if (filter.value) {
            if (Array.isArray(filter.value)) {
              params[`filters[${filter.id}][$in]`] = filter.value.join(",");
            } else {
              params[`filters[${filter.id}][$contains]`] = filter.value as string;
            }
          }
        });
        return params;
      }),
  },

  /** Supabase style */
  supabase: {
    transformSorting: (sorting: SortingState): Record<string, string> => {
      if (sorting.length === 0) return {};
      const order = sorting
        .map((s) => `${s.id}.${s.desc ? "desc" : "asc"}`)
        .join(",");
      return { order };
    },
    transformFilters: filterTransformers.direct,
  },

  /** GraphQL/Prisma style */
  prisma: {
    transformSorting: sortingTransformers.orderBy,
    transformFilters: filterTransformers.jsonEncoded,
  },
};