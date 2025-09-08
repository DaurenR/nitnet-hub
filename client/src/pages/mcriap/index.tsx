import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type {
  ColumnDef,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import ChannelTable from "../../components/ChannelTable";
import SearchForm from "../../components/SearchForm";
import Pagination from "../../components/Pagination";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import Loader from "../../components/Loader";
import usePagedList, { ColumnFilter } from "../../hooks/usePagedList";
import { api, getRole } from "../../lib/api";
import { Mcriap } from "../../types/mcriap";

function parseFilters(
  query: Record<string, string | string[] | undefined>
): ColumnFilter[] {
  const map: Record<string, ColumnFilter> = {};
  Object.entries(query).forEach(([key, value]) => {
    if (!key.startsWith("f_")) return;
    const raw = key.slice(2);
    const first = Array.isArray(value) ? value[0] : value;
    if (raw.endsWith("Min") || raw.endsWith("Max")) {
      const col = raw.replace(/(Min|Max)$/, "");
      const filter = (map[col] = map[col] || {
        column: col,
        type: "numberRange",
      });
      if (raw.endsWith("Min")) filter.min = first;
      else filter.max = first;
      return;
    }
    if (raw.endsWith("From") || raw.endsWith("To")) {
      const col = raw.replace(/(From|To)$/, "");
      const filter = (map[col] = map[col] || {
        column: col,
        type: "dateRange",
      });
      if (raw.endsWith("From")) filter.from = first;
      else filter.to = first;
      return;
    }
    const col = raw;
    const filter = (map[col] = map[col] || {
      column: col,
      value: [],
      type: "text",
    });
    const arr = Array.isArray(value) ? value : [value];
    filter.value = Array.isArray(filter.value)
      ? [...(filter.value as string[]), ...arr]
      : arr;
  });
  return Object.values(map);
}

export default function McriapPage() {
  const router = useRouter();
  const [refresh, setRefresh] = useState(0);
  const role = getRole();

  const getNumber = (v: string | string[] | undefined, def: number) => {
    const n = parseInt(Array.isArray(v) ? v[0] : v || "", 10);
    return isNaN(n) ? def : n;
  };
  const getString = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;
  const q = getString(router.query.q);

  const [sorting, setSorting] = useState<SortingState>(() => {
    const sort = getString(router.query.sort);
    const order = getString(router.query.order);
    return sort ? [{ id: sort, desc: order === "desc" }] : [];
  });
  const [pagination, setPagination] = useState<PaginationState>(() => ({
    pageIndex: getNumber(router.query.page, 1) - 1,
    pageSize: getNumber(router.query.perPage, 10),
  }));
  const [columnFilters, setColumnFilters] = useState<ColumnFilter[]>(() =>
    parseFilters(router.query)
  );

  useEffect(() => {
    setSorting(() => {
      const sort = getString(router.query.sort);
      const order = getString(router.query.order);
      return sort ? [{ id: sort, desc: order === "desc" }] : [];
    });
    setPagination(() => ({
      pageIndex: getNumber(router.query.page, 1) - 1,
      pageSize: getNumber(router.query.perPage, 10),
    }));
    setColumnFilters(parseFilters(router.query));
  }, [router.query]);

  useEffect(() => {
    const query: Record<string, string | string[] | undefined> = {
      ...router.query,
    };
    query.page = String(pagination.pageIndex + 1);
    query.perPage = String(pagination.pageSize);
    if (sorting[0]) {
      query.sort = sorting[0].id;
      query.order = sorting[0].desc ? "desc" : "asc";
    } else {
      delete query.sort;
      delete query.order;
    }
    Object.keys(query).forEach((key) => {
      if (key.startsWith("f_")) delete query[key];
    });
    columnFilters.forEach((f) => {
      if (f.type === "numberRange") {
        if (f.min !== undefined && f.min !== "")
          query[`f_${f.column}Min`] = String(f.min);
        if (f.max !== undefined && f.max !== "")
          query[`f_${f.column}Max`] = String(f.max);
        return;
      }
      if (f.type === "dateRange") {
        if (f.from) query[`f_${f.column}From`] = f.from;
        if (f.to) query[`f_${f.column}To`] = f.to;
        return;
      }
      const val = f.value;
      if (val === undefined || val === "") return;
      query[`f_${f.column}`] = Array.isArray(val) ? val : String(val);
    });
    router.replace({ pathname: router.pathname, query }, undefined, {
      shallow: true,
    });
  }, [sorting, pagination, columnFilters, router]);

  const columns: ColumnDef<Mcriap>[] = [
    { accessorKey: "id", header: "ID", meta: { filter: "numberRange" } },
    { accessorKey: "network", header: "Network", meta: { filter: "text" } },
    { accessorKey: "agencyName", header: "Agency", meta: { filter: "text" } },
    {
      accessorKey: "physicalAddress",
      header: "Address",
      meta: { filter: "text" },
    },
    { accessorKey: "serviceName", header: "Service", meta: { filter: "text" } },
    {
      accessorKey: "bandwidthKbps",
      header: "Bandwidth (Kbps)",
      meta: { className: "text-right", filter: "numberRange" },
    },
    {
      accessorKey: "tariffPlan",
      header: "Tariff Plan",
      meta: { filter: "text" },
    },
    {
      accessorKey: "connectionType",
      header: "Connection Type",
      meta: { filter: "text" },
    },
    { accessorKey: "provider", header: "Provider", meta: { filter: "text" } },
    { accessorKey: "region", header: "Region", meta: { filter: "text" } },
    {
      accessorKey: "externalId",
      header: "External ID",
      meta: { filter: "text" },
    },
    {
      accessorKey: "ipAddress",
      header: "IP Address",
      meta: { filter: "text" },
    },
    { accessorKey: "p2pIp", header: "P2P IP", meta: { filter: "text" } },
    { accessorKey: "manager", header: "Manager", meta: { filter: "text" } },
    {
      accessorKey: "createdAt",
      header: "Created At",
      meta: { filter: "dateRange" },
    },
    {
      accessorKey: "updatedAt",
      header: "Updated At",
      meta: { filter: "dateRange" },
    },
  ];

  const {
    data: channels,
    total,
    isLoading,
    error,
  } = usePagedList<Mcriap>("mcriap", {
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
    sort: sorting[0]?.id as string | undefined,
    order: sorting[0]?.desc ? "desc" : undefined,
    q,
    refresh,
    columnFilters,
  });

  const handleSearch = (values: Record<string, string>) => {
    router.replace(
      {
        pathname: router.pathname,
        query: { ...router.query, q: values.q, page: "1" },
      },
      undefined,
      { shallow: true }
    );
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete?")) return;
    const res = await api(`/mcriap/${id}`, {
      method: "DELETE",
    });
    if (res.status === 403) {
      alert("Forbidden");
      return;
    }
    if (res.ok) {
      if (channels.length === 1 && pagination.pageIndex > 0) {
        setPagination((p) => ({ ...p, pageIndex: p.pageIndex - 1 }));
      } else {
        setRefresh((r) => r + 1);
      }
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">MCIRIAP Channels</h1>
        {role === "manager" && (
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() =>
              router.push({ pathname: "/mcriap/create", query: router.query })
            }
          >
            Create
          </button>
        )}
      </div>
      <SearchForm
        fields={[{ name: "q", label: "Search", defaultValue: q || "" }]}
        onSearch={handleSearch}
      />
      {isLoading ? (
        <Loader />
      ) : error ? (
        <ErrorState />
      ) : channels.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <ChannelTable
            data={channels}
            columns={columns}
            columnFilters={columnFilters}
            onColumnFiltersChange={(filters) => {
              setColumnFilters(filters);
              setPagination((p) => ({ ...p, pageIndex: 0 }));
            }}
            renderActions={
              role === "manager"
                ? (row) => (
                    <>
                      <button
                        className="text-blue-600 hover:underline mr-2"
                        onClick={() =>
                          router.push({
                            pathname: `/mcriap/${row.id}/edit`,
                            query: router.query,
                          })
                        }
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:underline"
                        onClick={() => handleDelete(row.id as number)}
                      >
                        Delete
                      </button>
                    </>
                  )
                : undefined
            }
            sort={sorting[0]?.id}
            order={sorting[0]?.desc ? "desc" : "asc"}
            onSort={(field) =>
              setSorting((cur) =>
                cur[0]?.id === field
                  ? [{ id: field, desc: !cur[0].desc }]
                  : [{ id: field, desc: false }]
              )
            }
          />
          <Pagination
            page={pagination.pageIndex + 1}
            perPage={pagination.pageSize}
            total={total}
            onPageChange={(p) =>
              setPagination((prev) => ({ ...prev, pageIndex: p - 1 }))
            }
            onPerPageChange={(pp) =>
              setPagination({ pageIndex: 0, pageSize: pp })
            }
          />
        </>
      )}
    </div>
  );
}
