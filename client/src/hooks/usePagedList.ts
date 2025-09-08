import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { api } from "../lib/api";
import buildQuery from "../features/table/buildQuery";
import parseFilters from "../features/table/parseFilters";

export interface PagedListResult<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  isLoading: boolean;
  error: Error | null;
}

export default function usePagedList<T>(
  endpoint: "/mcriap" | "/mio",
): PagedListResult<T> {
  const router = useRouter();
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getNumber = (v: string | string[] | undefined, def: number) => {
    const n = parseInt(Array.isArray(v) ? v[0] : v || "", 10);
    return isNaN(n) ? def : n;
  };
  const getString = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;

  const page = getNumber(router.query.page, 1);
  const perPage = getNumber(router.query.perPage, 10);
  const sort = getString(router.query.sort);
  const order = getString(router.query.order);
  const q = getString(router.query.q);
  const columnFilters = parseFilters(router.query);
  const filtersStr = JSON.stringify(columnFilters);

  // Reset page to 1 when q, sort or filters change
  const prevRef = useRef<{
    q?: string;
    sort?: string;
    order?: string;
    filters: string;
  }>();
  const queryString = JSON.stringify(router.query);
  useEffect(() => {
    const prev = prevRef.current;
    if (
      prev &&
      (prev.q !== q ||
        prev.sort !== sort ||
        prev.order !== order ||
        prev.filters !== filtersStr) &&
      page !== 1
    ) {
      router.replace(
        { pathname: router.pathname, query: { ...router.query, page: "1" } },
        undefined,
        { shallow: true },
      );
    }
    prevRef.current = { q, sort, order, filters: filtersStr };
  }, [q, sort, order, filtersStr, page, router, queryString]);

  useEffect(() => {
    const page = getNumber(router.query.page, 1);
    const perPage = getNumber(router.query.perPage, 10);
    const sort = getString(router.query.sort);
    const order = getString(router.query.order);
    const q = getString(router.query.q);
    const columnFilters = parseFilters(router.query);
    const rest: Record<string, string | string[]> = { ...router.query };
    delete rest.page;
    delete rest.perPage;
    delete rest.sort;
    delete rest.order;
    delete rest.q;
    Object.keys(rest).forEach((key) => {
      if (key.startsWith("f_")) delete rest[key];
    });
    const params = buildQuery({
      page,
      perPage,
      sort,
      order,
      q,
      columnFilters,
      ...(rest as Record<string, string | number | string[] | undefined>),
    });

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    api(`${endpoint}?${params.toString()}`, { signal: controller.signal })
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
  }, [endpoint, queryString, router]);

 return { data, total, page, perPage, isLoading, error };
}
