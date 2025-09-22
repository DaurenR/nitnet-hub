import type { ColumnFilter } from "./types";

export interface BuildQueryParams {
  page?: number;
  perPage?: number;
  columnFilters?: ColumnFilter[];
  [key: string]: string | number | string[] | ColumnFilter[] | undefined;
}

export const stableStringify = (obj: unknown): string => {
  if (Array.isArray(obj)) {
    return `[${obj.map((v) => stableStringify(v)).join(",")}]`;
  }
  if (obj && typeof obj === "object") {
    return `{${Object.keys(obj)
      .sort()
      .map((key) => {
        const value = (obj as Record<string, unknown>)[key];
        if (value === undefined) return "";
        return `${JSON.stringify(key)}:${stableStringify(value)}`;
      })
      .filter(Boolean)
      .join(",")}}`;
  }
  return JSON.stringify(obj);
};

let cachedStr: string | undefined;
let cachedParams: URLSearchParams | undefined;

export default function buildQuery({
  page,
  perPage,
  columnFilters = [],
  ...rest
}: BuildQueryParams): URLSearchParams {
  const filtersStr = stableStringify(columnFilters);
  const key = stableStringify({ page, perPage, ...rest, filters: filtersStr });
  if (key === cachedStr && cachedParams) return cachedParams;
  
  const params = new URLSearchParams();

  const append = (k: string, v: unknown) => {
    if (v === undefined || v === null) return;
    const str = String(v).trim();
    if (str === "") return;
    params.append(k, str);
  };

  append("page", page);
  append("perPage", perPage);

  Object.entries(rest).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => append(key, v));
    } else {
      append(key, value);
    }
  });

  columnFilters.forEach((filter) => {
    if (filter.type === "numberRange") {
      append(`f_${filter.column}Min`, filter.min);
      append(`f_${filter.column}Max`, filter.max);
      return;
    }
    if (filter.type === "dateRange") {
      append(`f_${filter.column}From`, filter.from);
      append(`f_${filter.column}To`, filter.to);
      return;
    }

    const value = filter.value;
    if (Array.isArray(value)) {
      value.forEach((v) => append(`f_${filter.column}`, v));
    } else {
      append(`f_${filter.column}`, value);
    }
  });

  cachedStr = key;
  cachedParams = params;

  return params;
}
