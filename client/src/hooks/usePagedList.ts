import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { api } from "../lib/api";
import buildQuery from "../features/table/buildQuery";

const stableStringify = (obj: unknown): string => {
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
  const queryStrRef = useRef(stableStringify(router.query));
  const [queryStr, setQueryStr] = useState(queryStrRef.current);
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
  const filtersStr = JSON.stringify(
    Object.fromEntries(
      Object.entries(router.query).filter(([key]) => key.startsWith("f_")),
    ),
  );

  // Reset page to 1 when q, sort or filters change
  const prevRef = useRef<{
    q?: string;
    sort?: string;
    order?: string;
    filters: string;
  }>({ q, sort, order, filters: "" });
  useEffect(() => {
    const prev = prevRef.current;
     const shouldReset =
      prev &&
      (prev.q !== q ||
        prev.sort !== sort ||
        prev.order !== order ||
        prev.filters !== filtersStr) &&
      page !== 1;

    const nextQuery = shouldReset ? { ...router.query, page: "1" } : router.query;
    const nextQueryStr = stableStringify(nextQuery);

    if (queryStrRef.current !== nextQueryStr) {
      if (shouldReset) {
        router.replace(
          { pathname: router.pathname, query: nextQuery },
          undefined,
          { shallow: true },
        );
      }
      queryStrRef.current = nextQueryStr;
      setQueryStr(nextQueryStr);
    }
    prevRef.current = { q, sort, order, filters: filtersStr };
  }, [q, sort, order, filtersStr, page, perPage, router]);

  useEffect(() => {
    const page = getNumber(router.query.page, 1);
    const perPage = getNumber(router.query.perPage, 10);
    const sort = getString(router.query.sort);
    const order = getString(router.query.order);
    const q = getString(router.query.q);
    const rest: Record<string, string | string[] | undefined> = {
      ...router.query,
    };
    delete rest.page;
    delete rest.perPage;
    delete rest.sort;
    delete rest.order;
    delete rest.q;
    Object.entries(rest).forEach(([key, value]) => {
      if (key.startsWith("f_") && value === undefined) {
        delete rest[key];
      }
    });
    const params = buildQuery({
      page,
      perPage,
      sort,
      order,
      q,
      ...(rest as Record<string, string | number | string[] | undefined>),
    });

    const controller = new AbortController();
    setIsLoading(true);

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
        setError(null);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [endpoint, queryStr, router]);

 return { data, total, page, perPage, isLoading, error };
}
