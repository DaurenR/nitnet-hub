import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";
import type { ColumnFilter } from "../hooks/usePagedList";

interface Meta {
  className?: string;
  filter?: "text" | "numberRange" | "dateRange";
}

interface Props<T extends Record<string, unknown>> {
  data?: T[];
  columns: ColumnDef<T, unknown>[];
  sort?: string;
  order?: "asc" | "desc";
  onSort?: (field: string) => void;
  renderActions?: (row: T) => React.ReactNode;
  columnFilters?: ColumnFilter[];
  onColumnFiltersChange?: (filters: ColumnFilter[]) => void;
}

export default function ChannelTable<T extends Record<string, unknown>>({
  data = [],
  columns,
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
        typeof updater === "function" ? updater(table.getState().sorting) : updater;
      const first = next[0];
      if (first) {
        onSort?.(first.id as string);
      }
    },
  });

  const getFilter = (id: string) =>
    columnFilters.find((f) => f.column === id);

  const updateTextFilter = (id: string, value: string) => {
    const next = columnFilters.filter((f) => f.column !== id);
    if (value) next.push({ column: id, value, type: "text" });
    onColumnFiltersChange?.(next);
  };

  const updateNumberRangeFilter = (
    id: string,
    part: "min" | "max",
    value: string,
  ) => {
    const existing = getFilter(id);
    const nextFilter =
      existing && existing.type === "numberRange"
        ? { ...existing }
        : { column: id, type: "numberRange" as const };
    if (part === "min") nextFilter.min = value;
    else nextFilter.max = value;
    if (!nextFilter.min) delete nextFilter.min;
    if (!nextFilter.max) delete nextFilter.max;
    const next = columnFilters.filter((f) => f.column !== id);
    if (nextFilter.min !== undefined || nextFilter.max !== undefined) {
      next.push(nextFilter);
    }
    onColumnFiltersChange?.(next);
  };

  const updateDateRangeFilter = (
    id: string,
    part: "from" | "to",
    value: string,
  ) => {
    const existing = getFilter(id);
    const nextFilter =
      existing && existing.type === "dateRange"
        ? { ...existing }
        : { column: id, type: "dateRange" as const };
    if (part === "from") nextFilter.from = value;
    else nextFilter.to = value;
    if (!nextFilter.from) delete nextFilter.from;
    if (!nextFilter.to) delete nextFilter.to;
    const next = columnFilters.filter((f) => f.column !== id);
    if (nextFilter.from || nextFilter.to) {
      next.push(nextFilter);
    }
    onColumnFiltersChange?.(next);
  };

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
               {headerGroup.headers.map((header) => {
                const meta = header.column.columnDef.meta as Meta | undefined;
                const filter = meta?.filter;
                if (filter === "text") {
                  const existing = getFilter(header.column.id);
                  const val =
                    existing &&
                    existing.type !== "numberRange" &&
                    existing.type !== "dateRange"
                      ? (existing as { value: string | string[] | undefined })
                          .value ?? ""
                      : "";
                  return (
                    <th key={header.id} className="border p-2">
                      <input
                        className="w-full border p-1"
                        value={val as string}
                        onChange={(e) =>
                          updateTextFilter(header.column.id, e.target.value)
                        }
                      />
                    </th>
                  );
                }
                if (filter === "numberRange") {
                  const existing = getFilter(header.column.id);
                  const min =
                    existing && existing.type === "numberRange"
                      ? existing.min ?? ""
                      : "";
                  const max =
                    existing && existing.type === "numberRange"
                      ? existing.max ?? ""
                      : "";
                  return (
                    <th key={header.id} className="border p-2">
                      <div className="flex flex-col">
                        <input
                          type="number"
                          placeholder="Min"
                          className="w-full border p-1 mb-1"
                          value={min as string}
                          onChange={(e) =>
                            updateNumberRangeFilter(
                              header.column.id,
                              "min",
                              e.target.value,
                            )
                          }
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          className="w-full border p-1"
                          value={max as string}
                          onChange={(e) =>
                            updateNumberRangeFilter(
                              header.column.id,
                              "max",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </th>
                  );
                }
                if (filter === "dateRange") {
                  const existing = getFilter(header.column.id);
                  const from =
                    existing && existing.type === "dateRange"
                      ? existing.from ?? ""
                      : "";
                  const to =
                    existing && existing.type === "dateRange"
                      ? existing.to ?? ""
                      : "";
                  return (
                    <th key={header.id} className="border p-2">
                      <div className="flex flex-col">
                        <input
                          type="date"
                          className="w-full border p-1 mb-1"
                          value={from as string}
                          onChange={(e) =>
                            updateDateRangeFilter(
                              header.column.id,
                              "from",
                              e.target.value,
                            )
                          }
                        />
                        <input
                          type="date"
                          className="w-full border p-1"
                          value={to as string}
                          onChange={(e) =>
                            updateDateRangeFilter(
                              header.column.id,
                              "to",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </th>
                  );
                }
                return <th key={header.id} className="border p-2" />;
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
  );
}
