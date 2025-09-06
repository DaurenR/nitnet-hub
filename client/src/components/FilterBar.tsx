import React from "react";
import { ParsedUrlQuery } from "querystring";

interface Props {
  children?: React.ReactNode;
  query: ParsedUrlQuery;
  total?: number;
  onRemove: (key: string, value?: string) => void;
  onReset: () => void;
}

const EXCLUDED = new Set(["page", "perPage", "sort", "order"]);

export default function FilterBar({
  children,
  query,
  total = 0,
  onRemove,
  onReset,
}: Props) {
  const chips: { key: string; label: string; onRemove: () => void }[] = [];
  Object.entries(query).forEach(([key, value]) => {
    if (EXCLUDED.has(key) || value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v) {
          chips.push({
            key: `${key}:${v}`,
            label: `${key}: ${v}`,
            onRemove: () => onRemove(key, v),
          });
        }
      });
    } else if (value) {
      chips.push({
        key: `${key}:${value}`,
        label: `${key}: ${value}`,
        onRemove: () => onRemove(key),
      });
    }
  });

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-4 items-end">{children}</div>
      <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <span
              key={chip.key}
              className="bg-gray-200 px-2 py-1 rounded-full text-sm flex items-center"
            >
              {chip.label}
              <button
                className="ml-1 text-gray-600 hover:text-black"
                onClick={chip.onRemove}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-4 ml-auto">
          <span className="text-sm text-gray-700">{total} results</span>
          <button
            onClick={onReset}
            className="text-sm text-blue-600 hover:underline"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}