import type { ColumnFilter } from "./types";

export interface BuildQueryParams {
  page?: number;
  perPage?: number;
  columnFilters?: ColumnFilter[];
  [key: string]: string | number | string[] | ColumnFilter[] | undefined;
}

export default function buildQuery({
  page,
  perPage,
  columnFilters = [],
  ...rest
}: BuildQueryParams): URLSearchParams {
  const params = new URLSearchParams();

  if (page !== undefined) {
    params.set("page", String(page));
  }
  if (perPage !== undefined) {
    params.set("perPage", String(perPage));
  }

  Object.entries(rest).forEach(([key, value]) => {
    if (value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, String(v)));
    } else {
      params.append(key, String(value));
    }
  });

  columnFilters.forEach((filter) => {
    if (filter.type === "numberRange") {
      if (typeof filter.min === "number") {
        params.append(`f_${filter.column}Min`, String(filter.min));
      }
       if (typeof filter.max === "number") {
        params.append(`f_${filter.column}Max`, String(filter.max));
      }
      return;
    }
    if (filter.type === "dateRange") {
      if (filter.from) {
        params.append(`f_${filter.column}From`, filter.from);
      }
      if (filter.to) {
        params.append(`f_${filter.column}To`, filter.to);
      }
      return;
    }

    const value = filter.value;
    if (value === undefined || value === "") return;
    if (Array.isArray(value)) {
      value.forEach((v) =>
        params.append(`f_${filter.column}`, String(v)),
      );
    } else {
      params.append(`f_${filter.column}`, String(value));
    }
  });

  return params;
}
