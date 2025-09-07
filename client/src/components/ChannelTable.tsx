import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";

interface Column<T extends Record<string, unknown>> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
  filter?: React.ReactNode;
}

interface Props<T extends Record<string, unknown>> {
  data?: T[];
  columns: Column<T>[];
  sort?: string;
  order?: "asc" | "desc";
  onSort?: (field: string) => void;
  renderActions?: (row: T) => React.ReactNode;
}

interface Meta {
  className?: string;
  filter?: React.ReactNode;
}

export default function ChannelTable<T extends Record<string, unknown>>({
  data = [],
  columns,
  sort,
  order,
  onSort,
  renderActions,
}: Props<T>) {
  const columnDefs = React.useMemo(() => {
    const defs: ColumnDef<T, unknown>[] = columns.map((col) => ({
      accessorKey: String(col.key),
      header: col.label,
      cell: (info) =>
        col.render
          ? col.render(info.row.original)
          : String(info.getValue() ?? ""),
      meta: {
        className: col.className,
        filter: col.filter,
      } as Meta,
    }));

    if (renderActions) {
      defs.push({
        id: "__actions",
        header: "Actions",
        cell: (info) => renderActions(info.row.original),
        meta: { className: "", filter: null } as Meta,
      });
    }

    return defs;
  }, [columns, renderActions]);

  const table = useReactTable({
    data,
    columns: columnDefs,
    state: {
      sorting: sort ? [{ id: sort, desc: order === "desc" }] : [],
    },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(table.getState().sorting) : updater;
      const first = next[0];
      if (first) {
        onSort?.(first.id as string);
      }
    },
  });

  return (
    <table className="w-full border-collapse border border-gray-300">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <React.Fragment key={headerGroup.id}>
            <tr className="bg-gray-100">
              {headerGroup.headers.map((header) => {
                const isActive = sort === header.column.id;
                return (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className={`border p-2 cursor-pointer select-none ${
                      (header.column.columnDef.meta as Meta)?.className ?? ""
                    } ${isActive ? "bg-blue-50 font-semibold" : ""}`}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <span className="flex items-center">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getIsSorted() === "asc" && (
                        <span className="ml-1">▲</span>
                      )}
                      {header.column.getIsSorted() === "desc" && (
                        <span className="ml-1">▼</span>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
            <tr>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="border p-2">
                  {(header.column.columnDef.meta as Meta)?.filter ?? null}
                </th>
              ))}
            </tr>
          </React.Fragment>
        ))}
      </thead>
      <tbody>
         {table.getRowModel().rows.length === 0 ? (
          <tr>
            <td colSpan={table.getAllColumns().length} className="p-2">
              No data
            </td>
          </tr>
         ) : (
          table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={`border p-2 ${
                    (cell.column.columnDef.meta as Meta)?.className ?? ""
                  }`}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
