import { GetServerSideProps } from "next";

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
  channel: Channel;
};

export default function ChannelDetail({ channel }: Props) {
  return (
    <div className="p-8">
      <h1 className="text-3xl mb-6 font-bold">
        Канал #{channel.id}
      </h1>
      <div className="space-y-2">
        <div><strong>Agency:</strong> {channel.agencyName}</div>
        <div><strong>Provider:</strong> {channel.provider}</div>
        <div><strong>Service:</strong> {channel.serviceName}</div>
        <div><strong>IP Address:</strong> {channel.ipAddress}</div>
        <div><strong>P2P IP:</strong> {channel.p2pIp}</div>
        <div><strong>Bandwidth:</strong> {channel.bandwidthKbps} Kbps</div>
        <div><strong>Region:</strong> {channel.region}</div>
        <div><strong>Updated At:</strong> {new Date(channel.updatedAt).toLocaleString()}</div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = context.params?.id;
  const res = await fetch(`http://localhost:3001/channels/${id}`);
  
  if (res.status !== 200) {
    return {
      notFound: true,
    };
  }

  const channel: Channel = await res.json();

  return {
    props: {
      channel,
    },
  };
};
