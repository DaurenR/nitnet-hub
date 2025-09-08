import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import type { ColumnFilter } from "../features/table/types";

export interface PagedListParams {
  page?: number;
  perPage?: number;
  sort?: string;
  order?: string;
  q?: string;
  refresh?: number;
  columnFilters?: ColumnFilter[];
  [key: string]: string | number | string[] | ColumnFilter[] | undefined;
}

export interface PagedListResult<T> {
  data: T[];
  total: number;
  isLoading: boolean;
  error: Error | null;
}

export default function usePagedList<T>(
  endpoint: string,
   {
    page = 1,
    perPage = 10,
    refresh,
    columnFilters = [],
    ...rest
  }: PagedListParams = {},
): PagedListResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const restString = JSON.stringify(rest);
  const filtersString = JSON.stringify(columnFilters);
  const query = useMemo(
     () =>
      JSON.parse(restString) as Record<
        string,
        string | number | string[] | undefined
      >,
    [restString]
  );
  const filters = useMemo(
    () => JSON.parse(filtersString) as ColumnFilter[],
    [filtersString]
  );

  useEffect(() => {
    const params = new URLSearchParams({
      page: String(page),
      perPage: String(perPage),
    });
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined) return;
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, String(v)));
      } else {
        params.append(key, String(value));
      }
    });

     filters.forEach((filter) => {
      if (filter.type === "numberRange") {
        if (filter.min !== undefined && filter.min !== "") {
          params.append(`f_${filter.column}Min`, String(filter.min));
        }
        if (filter.max !== undefined && filter.max !== "") {
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
        value.forEach((v) => params.append(`f_${filter.column}`, String(v)));
      } else {
        params.append(`f_${filter.column}`, String(value));
      }
    });

    const controller = new AbortController();
    const url = `/${endpoint}?${params.toString()}`;
    setIsLoading(true);
    setError(null);

    api(url, {
      signal: controller.signal,
    })
      .then((res) => {
        if (res.status === 403) {
          alert("Forbidden");
          return Promise.reject(new Error("Forbidden"));
        }
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        setData(Array.isArray(json.data) ? json.data : []);
        setTotal(typeof json.total === "number" ? json.total : 0);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setData([]);
        setTotal(0);
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [endpoint, page, perPage, refresh, query, filters]);

  return { data, total, isLoading, error };
}
