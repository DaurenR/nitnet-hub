import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type {
  ColumnDef,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import DataTable from "../../features/table/DataTable";
import SearchForm from "../../components/SearchForm";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import Loader from "../../components/Loader";
import usePagedList from "../../hooks/usePagedList";
import type { ColumnFilter } from "../../features/table/types";
import { api, getRole } from "../../lib/api";
import { MioChannel } from "../../types/mio";
import parseFilters from "../../features/table/parseFilters";

export default function MioPage() {
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

  // Sync state with query changes
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

  // Sync query with state
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

  const columns: ColumnDef<MioChannel>[] = [
    { accessorKey: "id", header: "ID", meta: { filterType: "numberRange" } },
    {
      accessorKey: "repOfficeName",
      header: "Rep Office",
      meta: { filterType: "text" },
    },
    {
      accessorKey: "clientName",
      header: "Client",
      meta: { filterType: "text" },
    },
    {
      accessorKey: "endUser",
      header: "End User",
      meta: { filterType: "text" },
    },
    {
      accessorKey: "physicalAddress",
      header: "Address",
      meta: { filterType: "text" },
    },
    {
      accessorKey: "serviceName",
      header: "Service",
      meta: { filterType: "text" },
    },
    {
      accessorKey: "bandwidthKbps",
      header: "Bandwidth (Kbps)",
      meta: { className: "text-right", filterType: "numberRange" },
    },
    {
      accessorKey: "tariffPlan",
      header: "Tariff Plan",
      meta: { filterType: "text" },
    },
    {
      accessorKey: "connectionType",
      header: "Connection Type",
      meta: { filterType: "text" },
    },
    {
      accessorKey: "provider",
      header: "Provider",
      meta: { filterType: "text" },
    },
    {
      accessorKey: "providerId",
      header: "Provider ID",
      meta: { filterType: "text" },
    },
    {
      accessorKey: "ipAddress",
      header: "IP Address",
      meta: { filterType: "text" },
    },
    { accessorKey: "p2pIp", header: "P2P IP", meta: { filterType: "text" } },
    { accessorKey: "manager", header: "Manager", meta: { filterType: "text" } },
    {
      accessorKey: "createdAt",
      header: "Created At",
      meta: { filterType: "dateRange" },
    },
    {
      accessorKey: "updatedAt",
      header: "Updated At",
      meta: { filterType: "dateRange" },
    },
  ];

  const {
    data: channels,
    total,
    isLoading,
    error,
  } = usePagedList<MioChannel>("mio", {
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
    const res = await api(`/mio/${id}`, {
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
        <h1 className="text-3xl font-bold">MIO Channels</h1>
        {role === "manager" && (
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() =>
              router.push({ pathname: "/mio/create", query: router.query })
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
          <DataTable
            data={channels}
            columns={columns}
            total={total}
            page={pagination.pageIndex + 1}
            perPage={pagination.pageSize}
            onPageChange={(p) =>
              setPagination((prev) => ({ ...prev, pageIndex: p - 1 }))
            }
            onPerPageChange={(pp) =>
              setPagination({ pageIndex: 0, pageSize: pp })
            }
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
                            pathname: `/mio/${row.id}/edit`,
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
        </>
      )}
    </div>
  );
}
