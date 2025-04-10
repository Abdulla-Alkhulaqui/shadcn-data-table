export interface DataTableColumnConfig<TData> {
  id: string;
  title: string;
  accessor?: keyof TData;
  cellRenderer?: (row: TData) => React.ReactNode;
}
