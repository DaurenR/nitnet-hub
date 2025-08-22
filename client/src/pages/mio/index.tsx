import { useRouter } from "next/router";
import ChannelTable from "../../components/ChannelTable";
import SearchForm from "../../components/SearchForm";
import Pagination from "../../components/Pagination";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import Loader from "../../components/Loader";
import usePagedList from "../../hooks/usePagedList";

interface MioChannel extends Record<string, unknown> {
  id: number;
  provider: string;
  serviceName: string;
  ipAddress: string;
  updatedAt: string;
  updatedBy: string;
}

export default function MioPage() {
  const router = useRouter();

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
  return (
    <div className="p-8">
      <h1 className="text-3xl mb-6 font-bold">MIO Channels</h1>
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
              { key: "provider", label: "Provider" },
              { key: "serviceName", label: "Service Name" },
              { key: "ipAddress", label: "IP Address" },
              { key: "updatedAt", label: "Updated At" },
              { key: "updatedBy", label: "Updated By" },
            ]}
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