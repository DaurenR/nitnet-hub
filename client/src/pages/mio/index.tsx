import { useRouter } from "next/router";
import { useState } from "react";
import ChannelTable from "../../components/ChannelTable";
import SearchForm from "../../components/SearchForm";
import Pagination from "../../components/Pagination";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import Loader from "../../components/Loader";
import usePagedList from "../../hooks/usePagedList";
import { api, getRole } from "../../lib/api";
import { MioChannel } from "../../types/mio";

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

  const page = getNumber(router.query.page, 1);
  const perPage = getNumber(router.query.perPage, 10);
  const sort = getString(router.query.sort);
  const order = getString(router.query.order);
  const q = getString(router.query.q);

  const {
    data: channels,
    total,
    isLoading,
    error,
  } = usePagedList<MioChannel>("mio", {
    page,
    perPage,
    sort,
    order,
    q,
    refresh,
  });

  const handlePageChange = (p: number) => {
    router.push(
      { pathname: router.pathname, query: { ...router.query, page: p } },
      undefined,
      { shallow: true }
    );
  };

  const handlePerPageChange = (pp: number) => {
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, page: 1, perPage: pp },
      },
      undefined,
      { shallow: true }
    );
  };

  const handleSearch = (values: Record<string, string>) => {
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, page: 1, q: values.q },
      },
      undefined,
      { shallow: true }
    );
  };

  const allowedSort = new Set([
    "clientName",
    "endUser",
    "serviceName",
    "provider",
    "bandwidthKbps",
    "connectionType",
    "ipAddress",
    "p2pIp",
    "providerVrf",
    "manager",
    "createdAt",
  ]);

  const handleSort = (field: string) => {
    if (!allowedSort.has(field)) return;
    const nextOrder = sort === field && order === "asc" ? "desc" : "asc";
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, page: 1, sort: field, order: nextOrder },
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
      if (channels.length === 1 && page > 1) {
        router.push(
          {
            pathname: router.pathname,
            query: { ...router.query, page: page - 1 },
          },
          undefined,
          { shallow: true }
        );
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
          <ChannelTable
            data={channels}
            columns={[
              { key: "clientName", label: "Client Name" },
              { key: "endUser", label: "End User" },
              { key: "serviceName", label: "Service Name" },
              { key: "provider", label: "Provider" },
              { key: "bandwidthKbps", label: "Bandwidth" },
              { key: "connectionType", label: "Connection Type" },
              { key: "ipAddress", label: "IP Address" },
              { key: "p2pIp", label: "P2P IP" },
              { key: "providerVrf", label: "Provider VRF" },
              { key: "manager", label: "Manager" },
              { key: "createdAt", label: "Created At" },
            ]}
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
            sort={sort}
            order={order as "asc" | "desc" | undefined}
            onSort={handleSort}
          />
          <Pagination
            page={page}
            perPage={perPage}
            total={total}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
          />
        </>
      )}
    </div>
  );
}
