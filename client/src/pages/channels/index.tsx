import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import SearchForm from "../../components/SearchForm";
import ChannelTable from "../../components/ChannelTable";
import type { Channel } from "../../types/channel";

type Props = {
  channels: Channel[];
};

export default function ChannelsPage({ channels }: Props) {
  const router = useRouter();
  const { provider = "", agency = "", region = "", order = "" } = router.query;

  const handleSearch = (provider: string, agency: string, region: string) => {
    const query: Record<string, string> = {};
    if (provider) query.provider = provider;
    if (agency) query.agency = agency;
    if (region) query.region = region;
    router.push({ pathname: "/channels", query });
  };

  const handleSort = (field: string) => {
    const nextOrder = order === "asc" ? "desc" : "asc";
    router.push({
      pathname: "/channels",
      query: {
        provider,
        agency,
        region, // сохраняем текущие фильтры
        sort: field,
        order: nextOrder,
      },
    });
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl mb-6 font-bold">Channels</h1>

      <SearchForm
        provider={provider as string}
        agency={agency as string}
        region={region as string}
        onSearch={handleSearch}
      />

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

      <ChannelTable channels={channels} />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { provider, agency, region, sort, order } = context.query;

  const searchParams = new URLSearchParams();
  if (provider) searchParams.append("provider", provider.toString());
  if (agency) searchParams.append("agency", agency.toString());
  if (region) searchParams.append("region", region.toString());
  if (sort) searchParams.append("sort", sort.toString());
  if (order) searchParams.append("order", order.toString());

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
