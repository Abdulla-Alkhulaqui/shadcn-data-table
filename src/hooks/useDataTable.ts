import { useContext } from 'react';
import { DataTableContext } from '../components/data-table/context/DataTableContext';

export const useDataTable = () => {
  const context = useContext(DataTableContext);
  if (!context) {
    throw new Error('useDataTable must be used within a DataTableProvider');
  }
  return context;
};
