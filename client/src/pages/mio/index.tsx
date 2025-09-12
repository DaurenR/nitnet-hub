import { useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../../features/table/DataTable";
import SearchForm from "../../components/SearchForm";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import Loader from "../../components/Loader";
import usePagedList from "../../hooks/usePagedList";
import { api, getRole } from "../../lib/api";
import { MioChannel } from "../../types/mio";
import parseFilters from "../../features/table/parseFilters";
import buildQuery, { BuildQueryParams } from "../../features/table/buildQuery";
import type { ColumnFilter } from "../../features/table/types";

export default function MioPage() {
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
    usePagedList<MioChannel>("/mio");

  const update = useCallback(
    (params: BuildQueryParams) => {
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
    },
    [page, perPage, sort, order, q, columnFilters, router],
  );

  const columns = useMemo<ColumnDef<MioChannel>[]>(
    () => [
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
        accessorKey: "provider",
        header: "Provider",
        meta: { filterType: "text" },
      },
      {
        accessorKey: "connectionType",
        header: "Connection Type",
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
    ],
    [],
  );

  const handleSearch = useCallback(
    (values: Record<string, string>) => {
      update({ q: values.q });
    },
     [update],
  );

  const handleDelete = useCallback(
    async (id: number) => {
      if (!confirm("Delete?")) return;
      const res = await api(`/mio/${id}`, {
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
    },
    [channels, page, update],
  );

  const handlePageChange = useCallback(
    (p: number) => {
      update({ page: p });
    },
    [update],
  );

  const handlePerPageChange = useCallback(
    (pp: number) => {
      update({ perPage: pp, page: 1 });
    },
  [update],
  );

  const handleColumnFiltersChange = useCallback(
    (filters: ColumnFilter[]) => {
      update({ columnFilters: filters });
    },
    [update],
  );

  const handleSort = useCallback(
    (field: string) => {
      const nextOrder = sort === field && order !== "desc" ? "desc" : "asc";
      update({ sort: field, order: nextOrder });
    },
    [sort, order, update],
  );

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
            page={page}
            perPage={perPage}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
            columnFilters={columnFilters}
            onColumnFiltersChange={handleColumnFiltersChange}
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
            sort={sort as string | undefined}
            order={sort ? (order === "desc" ? "desc" : "asc") : undefined}
             onSort={handleSort}
          />
        </>
      )}
    </div>
  );
}
