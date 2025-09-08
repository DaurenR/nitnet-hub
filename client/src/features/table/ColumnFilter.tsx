import React from "react";
import type { ColumnFilter } from "./types";

interface Props {
  id: string;
  filterType?: "text" | "numberRange" | "dateRange";
  columnFilters: ColumnFilter[];
  onChange?: (filters: ColumnFilter[]) => void;
}

export default function ColumnFilter({
  id,
  filterType,
  columnFilters,
  onChange,
}: Props) {
  const getFilter = (col: string) =>
    columnFilters.find((f) => f.column === col);

  const updateTextFilter = (value: string) => {
    const next = columnFilters.filter((f) => f.column !== id);
    if (value) next.push({ column: id, value, type: "text" });
    onChange?.(next);
  };

  const updateNumberRangeFilter = (
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
    onChange?.(next);
  };

  const updateDateRangeFilter = (
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
    onChange?.(next);
  };

  if (filterType === "text") {
    const existing = getFilter(id);
    const val =
      existing && existing.type !== "numberRange" && existing.type !== "dateRange"
        ? (existing as { value: string | string[] | undefined }).value ?? ""
        : "";
    return (
      <input
        className="w-full border p-1"
        value={val as string}
        onChange={(e) => updateTextFilter(e.target.value)}
      />
    );
  }

  if (filterType === "numberRange") {
    const existing = getFilter(id);
    const min =
      existing && existing.type === "numberRange" ? existing.min ?? "" : "";
    const max =
      existing && existing.type === "numberRange" ? existing.max ?? "" : "";
    return (
      <div className="flex flex-col">
        <input
          type="number"
          placeholder="Min"
          className="w-full border p-1 mb-1"
          value={min as string}
          onChange={(e) => updateNumberRangeFilter("min", e.target.value)}
        />
        <input
          type="number"
          placeholder="Max"
          className="w-full border p-1"
          value={max as string}
          onChange={(e) => updateNumberRangeFilter("max", e.target.value)}
        />
      </div>
    );
  }

  if (filterType === "dateRange") {
    const existing = getFilter(id);
    const from =
      existing && existing.type === "dateRange" ? existing.from ?? "" : "";
    const to =
      existing && existing.type === "dateRange" ? existing.to ?? "" : "";
    return (
      <div className="flex flex-col">
        <input
          type="date"
          className="w-full border p-1 mb-1"
          value={from as string}
          onChange={(e) => updateDateRangeFilter("from", e.target.value)}
        />
        <input
          type="date"
          className="w-full border p-1"
          value={to as string}
          onChange={(e) => updateDateRangeFilter("to", e.target.value)}
        />
      </div>
    );
  }

  return null;
}