import React from "react";

interface Column<T extends Record<string, unknown>> {
  key: keyof T;
  label: string;
}

interface Props<T extends Record<string, unknown>> {
  data: T[];
  columns: Column<T>[];
}

export default function ChannelTable<T extends Record<string, unknown>>({
  data,
  columns,
}: Props<T>) {
  return (
    <table className="w-full border-collapse border border-gray-300">
      <thead>
        <tr className="bg-gray-100">
          {columns.map((col) => (
            <th key={String(col.key)} className="border p-2">
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={(row.id as React.Key) ?? idx}>
            {columns.map((col) => (
              <td key={String(col.key)} className="border p-2">
                {String(
                  (row as Record<string, unknown>)[col.key as string] ?? ""
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
