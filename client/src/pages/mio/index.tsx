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
  items: MioChannel[];
  total: number;
};

export default function MioPage({ items }: Props) {
  return (
    <div className="p-8">
      <h1 className="text-3xl mb-6 font-bold">MIO Channels</h1>
      <ChannelTable
        data={items}
        columns={[
          { key: "provider", label: "Provider" },
          { key: "serviceName", label: "Service Name" },
          { key: "ipAddress", label: "IP Address" },
          { key: "updatedAt", label: "Updated At" },
          { key: "updatedBy", label: "Updated By" },
        ]}
      />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mio`);
  const { items, total }: { items: MioChannel[]; total: number } =
    await res.json();
  return {
    props: {
      items,
      total,
    },
  };
};