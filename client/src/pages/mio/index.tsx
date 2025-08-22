import { GetServerSideProps } from "next";
import ChannelTable from "../../components/ChannelTable";

interface MioChannel extends Record<string, unknown> {
  id: number;
  provider: string;
  serviceName: string;
  ipAddress: string;
  updatedAt: string;
  updatedBy: string;
}

type Props = {
  channels: MioChannel[];
  total: number;
  page: number;
  perPage: number;
};

export default function MioPage({ channels }: Props) {
  return (
    <div className="p-8">
      <h1 className="text-3xl mb-6 font-bold">MIO Channels</h1>
      {channels.length === 0 ? (
        <p>No data</p>
      ) : (
        <ChannelTable
          data={channels}
          columns={[
            { key: "provider", label: "Provider" },
            { key: "serviceName", label: "Service Name" },
            { key: "ipAddress", label: "IP Address" },
            { key: "updatedAt", label: "Updated At" },
            { key: "updatedBy", label: "Updated By" },
          ]}
        />
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mio`);
    if (!res.ok) {
      return { props: { channels: [], total: 0, page: 1, perPage: 10 } };
    }
    const {
      data,
      total,
      page,
      perPage,
    }: { data: MioChannel[]; total: number; page: number; perPage: number } =
      await res.json();
    return {
      props: {
        channels: data,
        total,
        page,
        perPage,
      },
    };
  } catch {
    return { props: { channels: [], total: 0, page: 1, perPage: 10 } };
  }
};