import { useMemo } from "react";
import { useRouter } from "next/router";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../../features/table/DataTable";
import SearchForm from "../../components/SearchForm";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import Loader from "../../components/Loader";
import usePagedList from "../../hooks/usePagedList";
import { api, getRole } from "../../lib/api";
import { Mcriap } from "../../types/mcriap";
import parseFilters from "../../features/table/parseFilters";
import buildQuery, { BuildQueryParams } from "../../features/table/buildQuery";

export default function McriapPage() {
  const router = useRouter();
  const role = getRole();

  const getString = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;
  const q = getString(router.query.q);
  const sort = getString(router.query.sort);
  const order = getString(router.query.order);
 const columnFilters = useMemo(
    () => parseFilters(router.query),
    [router.query],
  );

  const { data: channels, total, page, perPage, isLoading, error } =
    usePagedList<Mcriap>("/mcriap");

  const update = (params: BuildQueryParams) => {
    const qs = buildQuery({
      page,
      perPage,
      sort,
      order,
      q,
      columnFilters,
      ...params,
    });
    router.replace(
      { pathname: router.pathname, query: Object.fromEntries(qs.entries()) },
      undefined,
      { shallow: true },
    );
  };

  const columns: ColumnDef<Mcriap>[] = [
    { accessorKey: "id", header: "ID", meta: { filterType: "numberRange" } },
    { accessorKey: "network", header: "Network", meta: { filterType: "text" } },
    { accessorKey: "agencyName", header: "Agency", meta: { filterType: "text" } },
    {
      accessorKey: "physicalAddress",
      header: "Address",
      meta: { filterType: "text" },
    },
    { accessorKey: "serviceName", header: "Service", meta: { filterType: "text" } },
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
    { accessorKey: "provider", header: "Provider", meta: { filterType: "text" } },
    { accessorKey: "region", header: "Region", meta: { filterType: "text" } },
    {
      accessorKey: "externalId",
      header: "External ID",
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

  const handleSearch = (values: Record<string, string>) => {
    update({ q: values.q });
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
       if (channels.length === 1 && page > 1) {
        update({ page: page - 1 });
      } else {
        update({ refresh: Date.now() });
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
          <DataTable
            data={channels}
            columns={columns}
            total={total}
            page={page}
            perPage={perPage}
            onPageChange={(p) => update({ page: p })}
            onPerPageChange={(pp) => update({ perPage: pp, page: 1 })}
            columnFilters={columnFilters}
            onColumnFiltersChange={(filters) => update({ columnFilters: filters })}
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
            sort={sort as string | undefined}
            order={sort ? (order === "desc" ? "desc" : "asc") : undefined}
            onSort={(field) => {
              const nextOrder =
                sort === field && order !== "desc" ? "desc" : "asc";
              update({ sort: field, order: nextOrder });
            }}
          />
        </>
      )}
    </div>
  );
}
