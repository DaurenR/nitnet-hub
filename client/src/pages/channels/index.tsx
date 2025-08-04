import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
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
    sort = "",
    order = "",
  } = router.query;

  const [providerInput, setProviderInput] = useState(provider);
  const [agencyInput, setAgencyInput] = useState(agency);
  const [regionInput, setRegionInput] = useState(region);

  const handleSearch = () => {
    const query: Record<string, string> = {};
    if (providerInput) query.provider = providerInput.toString();
    if (agencyInput) query.agency = agencyInput.toString();
    if (regionInput) query.region = regionInput.toString();
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

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Удалить запись?");
    if (!confirmed) return;

    try {
      const res = await fetch(`http://localhost:3001/channels/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Удалено!");
        // Обнови список, можно вручную удалить из state или перезапросить
      } else {
        alert("Ошибка при удалении");
      }
    } catch (err) {
      console.error(err);
      alert("Сервер не отвечает");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl mb-6 font-bold">Channels</h1>

      <div className="mb-6 flex gap-4 items-end">
        <div>
          <label className="block text-sm font-semibold">Provider</label>
          <input
            type="text"
            value={providerInput as string}
            onChange={(e) => setProviderInput(e.target.value)}
            className="border px-3 py-1 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold">Agency</label>
          <input
            type="text"
            value={agencyInput as string}
            onChange={(e) => setAgencyInput(e.target.value)}
            className="border px-3 py-1 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold">Region</label>
          <input
            type="text"
            value={regionInput as string}
            onChange={(e) => setRegionInput(e.target.value)}
            className="border px-3 py-1 rounded"
          />
        </div>
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Search
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

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ID</th>
            <th className="border p-2">Agency</th>
            <th className="border p-2">Provider</th>
            <th className="border p-2">Bandwidth</th>
            <th className="border p-2">IP Address</th>
            <th className="border p-2">Действия</th>
          </tr>
        </thead>
        <tbody>
          {channels.map((c) => (
            <tr key={c.id}>
              <td className="border p-2">{c.id}</td>
              <td className="border p-2">{c.agencyName}</td>
              <td className="border p-2">{c.provider}</td>
              <td className="border p-2">{c.bandwidthKbps} Kbps</td>
              <td className="border p-2">{c.ipAddress}</td>
              <td className="border p-2 text-center">
                <button
                  onClick={() => handleDelete(c.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                >
                  Удалить
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
    `http://localhost:3001/channels?${searchParams.toString()}`
  );
  const channels: Channel[] = await res.json();

  return {
    props: {
      channels,
    },
  };
};
