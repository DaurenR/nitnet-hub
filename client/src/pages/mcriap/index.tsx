import { useRouter } from "next/router";
import { useState } from "react";
import ChannelTable from "../../components/ChannelTable";
import SearchForm from "../../components/SearchForm";
import Pagination from "../../components/Pagination";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import Loader from "../../components/Loader";
import usePagedList from "../../hooks/usePagedList";

interface McriapChannel extends Record<string, unknown> {
  id: number;
  agencyName: string;
  provider: string;
  bandwidthKbps: number;
  region: string;
  ipAddress: string;
}

export default function McriapPage() {
  const router = useRouter();
  const [refresh, setRefresh] = useState(0);
  const role = process.env.NEXT_PUBLIC_ROLE;

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
  } = usePagedList<McriapChannel>("mcriap", {
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

  const handleSort = (field: string) => {
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
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mcriap/${id}`, {
      method: "DELETE",
      headers: { "x-role": process.env.NEXT_PUBLIC_ROLE },
    });
    if (res.status === 403) {
      alert("Forbidden");
      return;
    }
    if (res.ok) {
      alert("Deleted");
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
            columns={[
              { key: "id", label: "ID" },
              { key: "agencyName", label: "Agency" },
              { key: "provider", label: "Provider" },
              { key: "bandwidthKbps", label: "Bandwidth" },
              { key: "region", label: "Region" },
              { key: "ipAddress", label: "IP Address" },
            ]}
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
