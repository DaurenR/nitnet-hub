import { GetServerSideProps } from "next";
import { useState } from "react";
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
  channel: Channel;
};

export default function EditChannelPage({ channel }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(channel);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    await fetch(`http://localhost:3001/channels/${channel.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    router.push(`/channels/${channel.id}`);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4 font-bold">Edit Channel #{channel.id}</h1>
      <div className="grid grid-cols-2 gap-4 max-w-3xl">
        <div>
          <label>Agency Name</label>
          <input
            type="text"
            name="agencyName"
            value={form.agencyName}
            onChange={handleChange}
            className="border px-3 py-1 rounded w-full"
          />
        </div>
        <div>
          <label>Provider</label>
          <input
            type="text"
            name="provider"
            value={form.provider}
            onChange={handleChange}
            className="border px-3 py-1 rounded w-full"
          />
        </div>
        <div>
          <label>Bandwidth (Kbps)</label>
          <input
            type="number"
            name="bandwidthKbps"
            value={form.bandwidthKbps}
            onChange={handleChange}
            className="border px-3 py-1 rounded w-full"
          />
        </div>
        <div>
          <label>IP Address</label>
          <input
            type="text"
            name="ipAddress"
            value={form.ipAddress}
            onChange={handleChange}
            className="border px-3 py-1 rounded w-full"
          />
        </div>
        {/* Добавь остальные поля так же при желании */}
      </div>

      <button
        onClick={handleSubmit}
        className="mt-6 bg-green-600 text-white px-6 py-2 rounded"
      >
        Save
      </button>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = context.params?.id;
  const res = await fetch(`http://localhost:3001/channels/${id}`);
  
  if (res.status !== 200) {
    return { notFound: true };
  }

  const channel: Channel = await res.json();

  return {
    props: {
      channel,
    },
  };
};
