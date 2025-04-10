import { createContext } from 'react';
import { Table } from '@tanstack/react-table';

export const DataTableContext = createContext<{
  table: Table<any> | null;
  config: any;
}>({
  table: null,
  config: {},
});

export const DataTableProvider = DataTableContext.Provider;
