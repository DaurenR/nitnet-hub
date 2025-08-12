import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import SearchForm from "../../components/SearchForm";
import ChannelTable from "../../components/ChannelTable";
import type { Channel } from "../../types/channel";

type Props = {
  channels: Channel[];
};

export default function ChannelsPage({ channels }: Props) {
  const router = useRouter();
  const {
    provider = "",
    agency = "",
    region = "",
    order = "",
    sort = "",
    skip = "0",
    take = "10",
  } = router.query;

  const skipNumber = parseInt(skip as string, 10) || 0;
  const takeNumber = parseInt(take as string, 10) || 10;
  const currentPage = Math.floor(skipNumber / takeNumber) + 1;

  const [pageInput, setPageInput] = useState(currentPage.toString());
  const [takeInput, setTakeInput] = useState(takeNumber.toString());

  const handleSearch = (values: Record<string, string>) => {
    const { provider: providerInput, agency: agencyInput, region: regionInput } = values;
    const query: Record<string, string> = {};
    if (providerInput) query.provider = providerInput;
    if (agencyInput) query.agency = agencyInput;
    if (regionInput) query.region = regionInput;
    if (sort) query.sort = sort as string;
    if (order) query.order = order as string;
    query.take = takeNumber.toString();
    query.skip = "0";
    router.push({ pathname: "/channels", query });
  };

  const baseQuery = () => {
    const query: Record<string, string> = {};
    if (provider) query.provider = provider as string;
    if (agency) query.agency = agency as string;
    if (region) query.region = region as string;
    if (sort) query.sort = sort as string;
    if (order) query.order = order as string;
    return query;
  };

  const handleSort = (field: string) => {
    const nextOrder = order === "asc" ? "desc" : "asc";
    const query = baseQuery();
    query.sort = field;
    query.order = nextOrder;
    query.skip = skipNumber.toString();
    query.take = takeNumber.toString();
    router.push({ pathname: "/channels", query });
  };

  const handleNext = () => {
    const query = baseQuery();
    query.skip = (skipNumber + takeNumber).toString();
    query.take = takeNumber.toString();
    router.push({ pathname: "/channels", query });
  };

  const handlePrev = () => {
    const query = baseQuery();
    const newSkip = Math.max(0, skipNumber - takeNumber);
    query.skip = newSkip.toString();
    query.take = takeNumber.toString();
    router.push({ pathname: "/channels", query });
  };

  const handleApply = () => {
    const page = parseInt(pageInput, 10) || 1;
    const newTake = parseInt(takeInput, 10) || takeNumber;
    const query = baseQuery();
    query.take = newTake.toString();
    query.skip = ((page - 1) * newTake).toString();
    router.push({ pathname: "/channels", query });
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl mb-6 font-bold">Channels</h1>

      <SearchForm
        fields={[
          { name: "provider", label: "Provider", defaultValue: provider as string },
          { name: "agency", label: "Agency", defaultValue: agency as string },
          { name: "region", label: "Region", defaultValue: region as string },
        ]}
        onSearch={handleSearch}
      />

      <div className="mb-4 flex gap-4 items-end">
        <div>
          <label className="block text-sm font-semibold">Page</label>
          <input
            type="number"
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            className="border px-3 py-1 rounded w-20"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold">Per page</label>
          <input
            type="number"
            value={takeInput}
            onChange={(e) => setTakeInput(e.target.value)}
            className="border px-3 py-1 rounded w-24"
          />
        </div>
        <button
          onClick={handleApply}
          className="bg-gray-200 px-3 py-1 rounded"
        >
          Apply
        </button>
      </div>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => handleSort("bandwidthKbps")}
          className="bg-gray-200 px-3 py-1 rounded"
        >
          Sort by Bandwidth ({order === "asc" ? "↑" : "↓"})
        </button>
        <button
          onClick={() => handleSort("agencyName")}
          className="bg-gray-200 px-3 py-1 rounded"
        >
          Sort by Agency ({order === "asc" ? "↑" : "↓"})
        </button>
      </div>

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
      />

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={handlePrev}
          disabled={skipNumber === 0}
          className="bg-gray-200 px-3 py-1 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>Page {currentPage}</span>
        <button
          onClick={handleNext}
          className="bg-gray-200 px-3 py-1 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { provider, agency, region, sort, order, skip, take } = context.query;

  const searchParams = new URLSearchParams();
  if (provider) searchParams.append("provider", provider.toString());
  if (agency) searchParams.append("agency", agency.toString());
  if (region) searchParams.append("region", region.toString());
  if (sort) searchParams.append("sort", sort.toString());
  if (order) searchParams.append("order", order.toString());
  if (skip) searchParams.append("skip", skip.toString());
  if (take) searchParams.append("take", take.toString());

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/channels?${searchParams.toString()}`
  );
  const channels: Channel[] = await res.json();

  return {
    props: {
      channels,
    },
  };
};
