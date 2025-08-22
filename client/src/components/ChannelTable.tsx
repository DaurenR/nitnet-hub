import React from "react";

interface Column<T extends Record<string, unknown>> {
  key: keyof T;
  label: string;
}

interface Props<T extends Record<string, unknown>> {
  data?: T[];
  columns: Column<T>[];
  sort?: string;
  order?: "asc" | "desc";
  onSort?: (field: string) => void;
}

export default function ChannelTable<T extends Record<string, unknown>>({
  data = [],
  columns,
  sort,
  order,
  onSort,
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
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length}>No data</td>
          </tr>
         ) : (
          data.map((row, idx) => (
            <tr key={(row.id as React.Key) ?? idx}>
              {columns.map((col) => (
                <td key={String(col.key)} className="border p-2">
                  {String(
                    (row as Record<string, unknown>)[col.key as string] ?? ""
                  )}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
