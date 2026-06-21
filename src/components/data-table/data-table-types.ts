import type { Cell, Row } from "@tanstack/react-table";

type ClassNameValue<TContext> = string | ((context: TContext) => string);

export interface DataTableClasses<TData> {
  root?: string;
  toolbar?: string;
  tableWrapper?: string;
  table?: string;
  header?: string;
  headerRow?: string;
  headerCell?: string;
  body?: string;
  row?: ClassNameValue<Row<TData>>;
  cell?: ClassNameValue<Cell<TData, unknown>>;
  emptyRow?: string;
  emptyCell?: string;
  pagination?: string;
}

