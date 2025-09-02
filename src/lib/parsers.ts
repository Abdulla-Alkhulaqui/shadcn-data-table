import { type Parser, parseAsArrayOf, parseAsString } from "nuqs";
import { z } from "zod";
import type { SortingState } from "@tanstack/react-table";

// Schema for filter items
export const filterItemSchema = z.object({
  id: z.string(),
  value: z.union([z.string(), z.array(z.string())]),
});

export type FilterItemSchema = z.infer<typeof filterItemSchema>;

// Parser for sorting state
export function getSortingStateParser<TData>(
  columnIds: Set<string>
) {
  return parseAsString.withDefault('').withOptions({}).withParse(
    (value: string): SortingState => {
      if (!value) return [];
      
      try {
        return value.split(',').map(sortItem => {
          const [id, direction] = sortItem.split('.');
          if (!columnIds.has(id)) return null;
          
          return {
            id,
            desc: direction === 'desc'
          };
        }).filter(Boolean) as SortingState;
      } catch {
        return [];
      }
    }
  ).withSerialize((value: SortingState): string => {
    return value.map(sort => `${sort.id}.${sort.desc ? 'desc' : 'asc'}`).join(',');
  });
}

// Additional parsers for other data types
export const parseAsStringArray = parseAsArrayOf(parseAsString, ',');