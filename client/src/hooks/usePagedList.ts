import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { api } from "../lib/api";
import buildQuery, { stableStringify } from "../features/table/buildQuery";

export interface PagedListResult<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  isLoading: boolean;
  error: Error | null;
}

export default function usePagedList<T>(
  endpoint: "/mcriap" | "/mio"
): PagedListResult<T> {
  const router = useRouter();
  const [currentQuery, setCurrentQuery] = useState<
    Record<string, string | string[] | undefined>
  >(() => ({ ...router.query }));
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

  const routerQueryStr = useMemo(
    () => stableStringify(router.query),
    [router.query]
  );

  useEffect(() => {
    setCurrentQuery((prevQuery) => {
      const prevStr = stableStringify(prevQuery);
      if (prevStr === routerQueryStr) {
        return prevQuery;
      }
      return { ...router.query };
    });
  }, [router, routerQueryStr]);

  const page = getNumber(currentQuery.page, 1);
  const perPage = getNumber(currentQuery.perPage, 10);
  const sort = getString(currentQuery.sort);
  const order = getString(currentQuery.order);
  const q = getString(currentQuery.q);
  const filtersStr = stableStringify(
    Object.fromEntries(
      Object.entries(currentQuery).filter(([key]) => key.startsWith("f_"))
    )
  );

  // Reset page to 1 when q, sort or filters change
  const prevRef = useRef<{
    q?: string;
    sort?: string;
    order?: string;
    filters: string;
  }>({ q, sort, order, filters: filtersStr });
  useEffect(() => {
    const prev = prevRef.current;
    const shouldReset =
      prev &&
      (prev.q !== q ||
        prev.sort !== sort ||
        prev.order !== order ||
        prev.filters !== filtersStr) &&
      page !== 1;

    if (shouldReset) {
      const nextQuery = { ...currentQuery, page: "1" };
      setCurrentQuery(nextQuery);
      if (process.env.NODE_ENV !== "production") {
        const searchParams = new URLSearchParams();
        Object.entries(nextQuery).forEach(([key, value]) => {
          if (typeof value === "undefined") {
            return;
          }
          if (Array.isArray(value)) {
            value.forEach((item) => searchParams.append(key, item));
            return;
          }
          searchParams.append(key, value);
        });
        const queryString = searchParams.toString();
        const nextUrl = `${router.pathname}${
          queryString ? `?${queryString}` : ""
        }`;
        console.debug("[usePagedList] router.replace", nextUrl);
      }
      router.replace(
        { pathname: router.pathname, query: nextQuery },
        undefined,
        { shallow: true }
      );
    }

    prevRef.current = { q, sort, order, filters: filtersStr };
  }, [currentQuery, filtersStr, page, q, router, sort, order]);

  useEffect(() => {
    const rest: Record<string, string | string[] | undefined> = {
      ...currentQuery,
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

    const requestUrl = `${endpoint}?${params.toString()}`;
    const requestStartedAt = Date.now();
    if (process.env.NODE_ENV !== "production") {
      console.debug("[usePagedList] api start", requestUrl);
    }
    api(requestUrl, { signal: controller.signal })
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
         if (process.env.NODE_ENV !== "production") {
          console.debug(
            "[usePagedList] api end",
            requestUrl,
            `${Date.now() - requestStartedAt}ms`
          );
        }
        setIsLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [currentQuery, endpoint, order, page, perPage, q, sort]);

  return { data, total, page, perPage, isLoading, error };
}