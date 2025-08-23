import React from "react";

interface Column<T extends Record<string, unknown>> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface Props<T extends Record<string, unknown>> {
  data?: T[];
  columns: Column<T>[];
  sort?: string;
  order?: "asc" | "desc";
  onSort?: (field: string) => void;
  renderActions?: (row: T) => React.ReactNode;
}

export default function ChannelTable<T extends Record<string, unknown>>({
  data = [],
  columns,
  sort,
  order,
  onSort,
  renderActions,
}: Props<T>) {
  return (
    <table className="w-full border-collapse border border-gray-300">
      <thead>
        <tr className="bg-gray-100">
           {columns.map((col) => {
            const key = String(col.key);
            return (
              <th
                key={key}
                className="border p-2 cursor-pointer select-none"
                onClick={() => onSort?.(key)}
              >
                {col.label}
                {sort === key && (order === "asc" ? " ▲" : " ▼")}
              </th>
            );
          })}
          <th className="border p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length + 1}>No data</td>
          </tr>
         ) : (
          data.map((row, idx) => (
            <tr key={(row.id as React.Key) ?? idx}>
              {columns.map((col) => (
                <td key={col.key} className="border p-2">
                  {col.render
                    ? col.render(row)
                    : String(
                        (row as Record<string, unknown>)[
                          col.key as string
                        ] ?? ""
                      )}
                </td>
              ))}
              <td className="border p-2">{renderActions?.(row)}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
