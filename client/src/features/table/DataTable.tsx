import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";
import Pagination from "../../components/Pagination";
import type { ColumnFilter as ColumnFilterType } from "./types";
import ColumnFilter from "./ColumnFIlter";

interface Meta {
  className?: string;
  filterType?: "text" | "numberRange" | "dateRange";
}

interface Props<T extends Record<string, unknown>> {
  data?: T[];
  columns: ColumnDef<T, unknown>[];
  total: number;
  page: number;
  perPage: number;
  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  sort?: string;
  order?: "asc" | "desc";
  onSort?: (field: string) => void;
  renderActions?: (row: T) => React.ReactNode;
  columnFilters?: ColumnFilterType[];
  onColumnFiltersChange?: (filters: ColumnFilterType[]) => void;
}

export default function DataTable<T extends Record<string, unknown>>({
  data = [],
  columns,
  total,
  page,
  perPage,
  onPageChange,
  onPerPageChange,
  sort,
  order,
  onSort,
  renderActions,
  columnFilters = [],
  onColumnFiltersChange,
}: Props<T>) {
  const columnDefs = React.useMemo(() => {
    const defs: ColumnDef<T, unknown>[] = [...columns];

    if (renderActions) {
      defs.push({
        id: "__actions",
        header: "Actions",
        cell: (info) => renderActions(info.row.original),
        meta: { className: "" } as Meta,
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
        typeof updater === "function"
          ? updater(table.getState().sorting)
          : updater;
      const first = next[0];
      if (first) {
        onSort?.(first.id as string);
      }
    },
  });

  return (
    <>
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
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as Meta | undefined;
                  return (
                    <th key={header.id} className="border p-2">
                      <ColumnFilter
                        id={header.column.id}
                        filterType={meta?.filterType}
                        columnFilters={columnFilters}
                        onChange={onColumnFiltersChange}
                      />
                    </th>
                  );
                })}
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
      <Pagination
        page={page}
        perPage={perPage}
        total={total}
        onPageChange={onPageChange ?? (() => {})}
        onPerPageChange={onPerPageChange}
      />
    </>
  );
}
