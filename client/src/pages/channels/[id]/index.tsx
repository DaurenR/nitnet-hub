import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

type Channel = {
  id: number;
  network: string;
  agencyName: string;
  physicalAddress: string;
  serviceName: string;
  bandwidthKbps: number;
  tariffPlan: string;
  connectionType: string;
  provider: string;
  region: string;
  ipAddress: string;
  p2pIp: string;
  manager: string;
  updatedAt: string;
  updatedBy: string;
};

type Props = {
  channels: Channel[];
};

export default function ChannelsPage({ channels }: Props) {
  const router = useRouter();
  const { skip = "0", take = "10" } = router.query;

  const currentSkip = Number(skip);
  const currentTake = Number(take);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Channels</h1>

      <table className="w-full border-collapse border text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Agency</th>
            <th className="border px-2 py-1">Provider</th>
            <th className="border px-2 py-1">Bandwidth</th>
            <th className="border px-2 py-1">Region</th>
            <th className="border px-2 py-1">IP Address</th>
          </tr>
        </thead>
        <tbody>
          {channels.map(channel => (
            <tr key={channel.id}>
              <td className="border px-2 py-1">{channel.id}</td>
              <td className="border px-2 py-1">{channel.agencyName}</td>
              <td className="border px-2 py-1">{channel.provider}</td>
              <td className="border px-2 py-1">{channel.bandwidthKbps} Kbps</td>
              <td className="border px-2 py-1">{channel.region}</td>
              <td className="border px-2 py-1">{channel.ipAddress}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex gap-4 mt-6">
        <button
          onClick={() =>
            router.push(
              `/channels?skip=${Math.max(0, currentSkip - currentTake)}&take=${currentTake}`
            )
          }
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Prev
        </button>
        <button
          onClick={() =>
            router.push(`/channels?skip=${currentSkip + currentTake}&take=${currentTake}`)
          }
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}

// SSR: получаем данные с бэка с учетом skip и take
export const getServerSideProps: GetServerSideProps = async (context) => {
  const skip = context.query.skip || "0";
  const take = context.query.take || "10";

  const res = await fetch(`http://localhost:3001/channels?skip=${skip}&take=${take}`);
  const channels: Channel[] = await res.json();

  return {
    props: {
      channels,
    },
  };
};
