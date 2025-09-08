import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { api } from "../lib/api";
import type { ColumnFilter } from "../features/table/types";
import buildQuery from "../features/table/buildQuery";

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
  const router = useRouter();

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
    const params = buildQuery({
      page,
      perPage,
      columnFilters: filters,
      ...query,
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

  useEffect(() => {
    const params = buildQuery({
      page,
      perPage,
      columnFilters: filters,
      ...query,
    });
    const qs = params.toString();
    const pathname = router.pathname;
    router.replace(qs ? `${pathname}?${qs}` : pathname, undefined, {
      shallow: true,
    });
  }, [router, page, perPage, query, filters]);

  return { data, total, isLoading, error };
}
