import { useEffect, useState } from "react";

interface Params {
  page?: number;
  perPage?: number;
  sort?: string;
  order?: string;
  q?: string;
}

interface Result<T> {
  data: T[];
  total: number;
  loading: boolean;
  page: number;
  perPage: number;
}

export default function usePagedList<T>(
  endpoint: string,
  { page = 1, perPage = 10, sort, order, q }: Params
): Result<T> {
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams({
      page: String(page),
      perPage: String(perPage),
    });
    if (sort) params.append("sort", sort);
    if (order) params.append("order", order);
    if (q) params.append("q", q);

    const url = `${process.env.NEXT_PUBLIC_API_URL}/${endpoint}?${params.toString()}`;
    let cancelled = false;
    setLoading(true);
    fetch(url)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((json) => {
        if (cancelled) return;
        setData(json.data || []);
        setTotal(json.total || 0);
      })
      .catch(() => {
        if (cancelled) return;
        setData([]);
        setTotal(0);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [endpoint, page, perPage, sort, order, q]);

  return { data, total, loading, page, perPage };
}