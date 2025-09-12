import React, { useEffect, useRef, useState } from "react";
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
  const [text, setText] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const getFilter = (col: string) =>
    columnFilters.find((f) => f.column === col);

  const updateTextFilter = (value: string) => {
    const next = columnFilters.filter((f) => f.column !== id);
    if (value) next.push({ column: id, value, type: "text" });
    onChange?.(next);
  };

  const updateNumberRangeFilter = (part: "min" | "max", value: string) => {
    const parsed = value === "" ? undefined : Number(value);
    const num = Number.isFinite(parsed) ? parsed : undefined;
    const existing = getFilter(id);
    const nextFilter =
      existing && existing.type === "numberRange"
        ? { ...existing }
        : { column: id, type: "numberRange" as const };
    if (part === "min") {
      if (num !== undefined) nextFilter.min = num;
      else delete nextFilter.min;
    } else {
      if (num !== undefined) nextFilter.max = num;
      else delete nextFilter.max;
    }
    const next = columnFilters.filter((f) => f.column !== id);
    if (nextFilter.min !== undefined || nextFilter.max !== undefined) {
      next.push(nextFilter);
    }
    onChange?.(next);
  };

  const updateDateRangeFilter = (part: "from" | "to", value: string) => {
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

  useEffect(() => {
    const existing = columnFilters.find((f) => f.column === id);
    const val =
      existing && existing.type === "text" ? existing.value ?? "" : "";
       setText(val as string);
  }, [columnFilters, id, filterType]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  if (filterType === "text") {
    return (
      <input
        className="w-full border p-1"
         value={text}
        onChange={(e) => {
          const value = e.target.value;
          setText(value);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => updateTextFilter(value), 350);
        }}
      />
    );
  }

  if (filterType === "numberRange") {
    const existing = getFilter(id);
    const min =
      existing && existing.type === "numberRange" ? existing.min : undefined;
    const max =
     existing && existing.type === "numberRange" ? existing.max : undefined;
    return (
      <div className="flex flex-col">
        <input
          type="number"
          placeholder="Min"
          className="w-full border p-1 mb-1"
          value={min ?? ""}
          onChange={(e) => updateNumberRangeFilter("min", e.target.value)}
        />
        <input
          type="number"
          placeholder="Max"
          className="w-full border p-1"
          value={max ?? ""}
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
