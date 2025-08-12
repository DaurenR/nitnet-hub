import { GetServerSideProps } from "next";
import ChannelTable from "../../components/ChannelTable";

interface MioChannel extends Record<string, unknown> {
  id: number;
  agencyName: string;
  provider: string;
  bandwidthKbps: number;
  region: string;
  ipAddress: string;
}

type Props = {
  channels: MioChannel[];
};

export default function MioPage({ channels }: Props) {
  return (
    <div className="p-8">
      <h1 className="text-3xl mb-6 font-bold">MIO Channels</h1>
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
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mio`);
  const channels: MioChannel[] = await res.json();
  return {
    props: {
      channels,
    },
  };
};