import { useRouter } from "next/router";
import { useState } from "react";
import ChannelTable from "../../components/ChannelTable";
import SearchForm from "../../components/SearchForm";
import Pagination from "../../components/Pagination";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import Loader from "../../components/Loader";
import MultiSelect from "../../components/MultiSelect";
import RangeInput from "../../components/RangeInput";
import DateRange from "../../components/DateRange";
import Checkbox from "../../components/Checkbox";
import usePagedList from "../../hooks/usePagedList";
import { api, getRole } from "../../lib/api";
import { Mcriap } from "../../types/mcriap";

const providerOptions = [
  { value: "ДКБ Казахтелеком", label: "ДКБ Казахтелеком" },
  { value: "КАР-ТЕЛ", label: "КАР-ТЕЛ" },
  { value: "Astel", label: "Astel" },
  { value: "Jusan Mobile", label: "Jusan Mobile" },
  { value: "АО Транстелеком", label: "АО Транстелеком" },
  { value: "АО НИТ", label: "АО НИТ" },
];

const connectionTypeOptions = [
  { value: "ADSL", label: "ADSL" },
  { value: "ВОЛС", label: "ВОЛС" },
  { value: "РРЛ", label: "РРЛ" },
];

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
  const getArray = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v : v ? [v] : [];

  const page = getNumber(router.query.page, 1);
  const perPage = getNumber(router.query.perPage, 10);
  const sort = getString(router.query.sort);
  const order = getString(router.query.order);
  const q = getString(router.query.q);

  const providers = getArray(router.query.provider);
  const connections = getArray(router.query.connectionType);
  const bandwidthMin = getString(router.query.bandwidthMin);
  const bandwidthMax = getString(router.query.bandwidthMax);
  const createdFrom = getString(router.query.createdFrom);
  const createdTo = getString(router.query.createdTo);
  const ipPresent = router.query.ipPresent !== undefined;

  const updateQuery = (
    changes: Record<string, string | string[] | undefined>
  ) => {
    const next: Record<string, string | string[] | undefined> = {
      ...router.query,
      ...changes,
      page: "1",
    };
    Object.keys(next).forEach((key) => {
      const value = next[key];
      if (
        value === undefined ||
        value === "" ||
        (Array.isArray(value) && value.length === 0)
      ) {
        delete next[key];
      }
    });
    router.replace({ pathname: router.pathname, query: next }, undefined, {
      shallow: true,
    });
  };

  const columns = [
    { key: "id", label: "ID" },
    { key: "network", label: "Network" },
    { key: "agencyName", label: "Agency" },
    { key: "physicalAddress", label: "Address" },
    { key: "serviceName", label: "Service" },
    {
      key: "bandwidthKbps",
      label: "Bandwidth (Kbps)",
      className: "text-right",
      filter: (
        <RangeInput
          label=""
          minName="bandwidthMin"
          maxName="bandwidthMax"
          minValue={bandwidthMin}
          maxValue={bandwidthMax}
          onChange={(name, value) => updateQuery({ [name]: value })}
        />
      ),
    },
    { key: "tariffPlan", label: "Tariff Plan" },
    {
      key: "connectionType",
      label: "Connection Type",
      filter: (
        <MultiSelect
          name="connectionType"
          label=""
          options={connectionTypeOptions}
          values={connections}
          onChange={(vals) => updateQuery({ connectionType: vals })}
        />
      ),
    },
    {
      key: "provider",
      label: "Provider",
      filter: (
        <MultiSelect
          name="provider"
          label=""
          options={providerOptions}
          values={providers}
          onChange={(vals) => updateQuery({ provider: vals })}
        />
      ),
    },
    { key: "region", label: "Region" },
    { key: "externalId", label: "External ID" },
    {
      key: "ipAddress",
      label: "IP Address",
      filter: (
        <Checkbox
          name="ipPresent"
          label=""
          checked={ipPresent}
          onChange={(checked) =>
            updateQuery({ ipPresent: checked ? "1" : undefined })
          }
        />
      ),
    },
    { key: "p2pIp", label: "P2P IP" },
    { key: "manager", label: "Manager" },
    {
      key: "createdAt",
      label: "Created At",
      filter: (
        <DateRange
          label=""
          fromName="createdFrom"
          toName="createdTo"
          fromValue={createdFrom}
          toValue={createdTo}
          onChange={(name, value) => updateQuery({ [name]: value })}
        />
      ),
    },
    { key: "updatedAt", label: "Updated At" },
  ];

  const {
    data: channels,
    total,
    isLoading,
    error,
  } = usePagedList<Mcriap>("mcriap", {
    ...router.query,
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
    updateQuery({ q: values.q });
  };

  const handleSort = (field: string) => {
    if (!columns.find((c) => c.key === field)) return;
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
    const res = await api(`/mcriap/${id}`, {
      method: "DELETE",
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
            columns={columns}
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
