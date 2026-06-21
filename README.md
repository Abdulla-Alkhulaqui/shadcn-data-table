# Shadcn Data Table

A comprehensive, flexible data table package built on top of TanStack Table and shadcn/ui components. Supports both client-side and server-side data management with advanced filtering, sorting, and pagination.

## Features

- 🚀 **Dual Mode Support**: Client-side and server-side data tables
- 🎛️ **Advanced Filtering**: Faceted filters, search, and custom filter components
- 📊 **Flexible Sorting**: Multi-column sorting with custom sort indicators
- 📄 **Pagination**: Customizable pagination with page size options
- 🎨 **Customizable UI**: Built with shadcn/ui components, fully customizable
- 🔧 **TypeScript**: Full TypeScript support with comprehensive type definitions
- ⚡ **Performance Optimized**: Memoized components and optimized re-renders
- 🎯 **Accessible**: ARIA compliant components

## Installation

```bash
npm install shadcn-data-table
```

## Quick Start

### Client-Side Data Table

```tsx
import { DataTable, useDataTable, DataTableToolbar } from "shadcn-data-table";

function ClientTable() {
  const data = [
    { id: 1, name: "John", email: "john@example.com" },
    { id: 2, name: "Jane", email: "jane@example.com" },
  ];

  const columns = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "email", 
      header: "Email",
    },
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      renderToolbar={(table) => (
        <DataTableToolbar
          table={table}
          searchColumn="name"
          searchPlaceholder="Search names..."
        />
      )}
    />
  );
}
```

### Server-Side Data Table

```tsx
import { BackendDataTable, DataTableToolbar } from "shadcn-data-table";

function ServerTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const handleDataChange = async ({ page, pageSize, sorting, filters }) => {
    setLoading(true);
    try {
      const result = await fetchData({ page, pageSize, sorting, filters });
      setData(result.data);
      setTotalCount(result.total);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackendDataTable
      data={data}
      columns={columns}
      totalCount={totalCount}
      loading={loading}
      onDataChange={handleDataChange}
      renderToolbar={(table) => (
        <DataTableToolbar
          table={table}
          searchColumn="name"
          facetedFilters={[
            {
              column: "status",
              title: "Status",
              options: [
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
              ]
            }
          ]}
        />
      )}
    />
  );
}
```

## Components

### Core Components

- **`DataTable`**: Client-side data table with built-in filtering, sorting, and pagination
- **`BackendDataTable`**: Server-side data table for handling large datasets
- **`DataTableToolbar`**: Customizable toolbar with search and filters
- **`DataTablePagination`**: Pagination component with page size options
- **`DataTableColumnHeader`**: Sortable column headers
- **`DataTableFacetedFilter`**: Multi-select filter dropdown
- **`DataTableViewOptions`**: Column visibility controls
- **`DataTableRowActions`**: Row-level action menus

### Hooks

- **`useDataTable`**: Advanced hook for URL-synced table state
- **`useDebouncedCallback`**: Debounce utility for search and filters

### Utilities

- **Table Configurations**: Pre-configured table setups for common use cases
- **Constants**: Reusable constants for pagination, debouncing, etc.
- **Helpers**: Utility functions for table initialization and management

## API Reference

### DataTable Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `TData[]` | - | Array of data objects |
| `columns` | `ColumnDef<TData, TValue>[]` | - | Column definitions |
| `renderToolbar` | `(table) => ReactNode` | - | Optional toolbar renderer |

### BackendDataTable Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `TData[]` | - | Array of data objects |
| `columns` | `ColumnDef<TData, TValue>[]` | - | Column definitions |
| `totalCount` | `number` | - | Total number of records |
| `loading` | `boolean` | `false` | Loading state |
| `onDataChange` | `function` | - | Callback for data fetching |
| `renderToolbar` | `(table) => ReactNode` | - | Optional toolbar renderer |
| `initialPageSize` | `number` | `25` | Initial page size |

### DataTableToolbar Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `table` | `Table<TData>` | - | Table instance |
| `searchColumn` | `string` | - | Column ID for search |
| `searchPlaceholder` | `string` | `"Search..."` | Search input placeholder |
| `facetedFilters` | `FacetedFilterConfig[]` | `[]` | Filter configurations |
| `addButtonLabel` | `string` | - | Add button text |
| `onAddClick` | `function` | - | Add button handler |

## Styling

The package uses shadcn/ui components and Tailwind CSS. You can customize the appearance by:

1. **Overriding CSS classes**: Use the `className` prop on components
2. **Theme customization**: Modify your shadcn/ui theme configuration
3. **Custom components**: Replace individual sub-components with your own

## Performance

The package is optimized for performance with:

- **Memoized components** to prevent unnecessary re-renders
- **Stable references** for table configurations
- **Debounced inputs** for search and filters
- **Virtualization support** (via TanStack Table)

## TypeScript

Full TypeScript support with:

- Generic type parameters for data shapes
- Comprehensive type definitions for all props
- Type-safe column definitions and data access
- Exported utility types for custom implementations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
