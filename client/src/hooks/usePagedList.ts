import { useEffect, useState } from "react";

export interface PagedListParams {
  page?: number;
  perPage?: number;
  sort?: string;
  order?: string;
  q?: string;
  refresh?: number;
}

export interface PagedListResult<T> {
  data: T[];
  total: number;
  isLoading: boolean;
  error: Error | null;
}

export default function usePagedList<T>(
  endpoint: string,
   { page = 1, perPage = 10, sort, order, q, refresh }: PagedListParams = {}
): PagedListResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const params = new URLSearchParams({
      page: String(page),
      perPage: String(perPage),
    });
    if (sort) params.append("sort", sort);
    if (order) params.append("order", order);
    if (q) params.append("q", q);

    const controller = new AbortController();
    const url = `${
      process.env.NEXT_PUBLIC_API_URL
    }/${endpoint}?${params.toString()}`;
    setIsLoading(true);
    setError(null);

    fetch(url, { signal: controller.signal })
      .then((res) => {
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
  }, [endpoint, page, perPage, sort, order, q, refresh]);

  return { data, total, isLoading, error };
}
