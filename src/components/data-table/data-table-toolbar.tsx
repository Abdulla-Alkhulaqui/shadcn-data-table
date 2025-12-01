"use client";

import * as React from "react";
import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";

export interface FacetedFilterConfig<TData> {
  column: string; // column id
  title: string; // filter title
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchColumn?: string; // optional text search column
  searchPlaceholder?: string;
  facetedFilters?: FacetedFilterConfig<TData>[]; // list of filters
  addButtonLabel?: string; // optional "Add" button
  onAddClick?: () => void;
  refetch?: () => void; // optional refetch function
}

export function DataTableToolbar<TData>({
  table,
  searchColumn,
  searchPlaceholder = "Search...",
  facetedFilters = [],
  addButtonLabel,
  onAddClick,
  refetch,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  // Use uncontrolled input with ref to avoid React state issues
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Initialize input value from table filter on mount
  React.useEffect(() => {
    if (searchColumn && searchInputRef.current) {
      const initialValue =
        (table.getColumn(searchColumn)?.getFilterValue() as string) ?? "";
      searchInputRef.current.value = initialValue;
    }
  }, [searchColumn]);

  // Debounced callback to update table filter
  const debouncedSetFilter = useDebouncedCallback((value: string) => {
    if (searchColumn) {
      table.getColumn(searchColumn)?.setFilterValue(value);
    }
  }, 300);

  // Handle search input changes using native input events
  const handleSearchChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      debouncedSetFilter(value); // Only update table filter, let input handle its own value
    },
    [debouncedSetFilter]
  );

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center gap-2">
        {searchColumn && (
          <Input
            ref={searchInputRef}
            placeholder={searchPlaceholder}
            onChange={handleSearchChange}
            className="h-8 w-[250px] lg:w-[250px]"
          />
        )}

        {facetedFilters.map((filter) => {
          const column = table.getColumn(filter.column);
          if (!column) return null;

          return (
            <DataTableFacetedFilter
              key={filter.column}
              column={column}
              title={filter.title}
              options={filter.options}
            />
          );
        })}

        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.resetColumnFilters()}
          >
            Reset
            <X className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <DataTableViewOptions table={table} />
        {addButtonLabel && (
          <Button size="sm" onClick={onAddClick}>
            {addButtonLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
