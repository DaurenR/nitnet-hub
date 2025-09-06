import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

export interface PagedListParams {
  page?: number;
  perPage?: number;
  sort?: string;
  order?: string;
  q?: string;
  refresh?: number;
  [key: string]: string | number | string[] | undefined;
}

export interface PagedListResult<T> {
  data: T[];
  total: number;
  isLoading: boolean;
  error: Error | null;
}

export default function usePagedList<T>(
  endpoint: string,
   { page = 1, perPage = 10, refresh, ...rest }: PagedListParams = {},
): PagedListResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const restString = JSON.stringify(rest);
  const query = useMemo(
     () =>
      JSON.parse(restString) as Record<
        string,
        string | number | string[] | undefined
      >,
    [restString]
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
  }, [endpoint, page, perPage, refresh, query]);

  return { data, total, isLoading, error };
}
