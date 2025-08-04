import React from "react";
import type { Channel } from "../types/channel";

interface Props {
  channels: Channel[];
  showRegion?: boolean;
}

export default function ChannelTable({ channels, showRegion = false }: Props) {
  return (
    <table className="w-full border-collapse border border-gray-300">
      <thead>
        <tr className="bg-gray-100">
          <th className="border p-2">ID</th>
          <th className="border p-2">Agency</th>
          <th className="border p-2">Provider</th>
          <th className="border p-2">Bandwidth</th>
          {showRegion && <th className="border p-2">Region</th>}
          <th className="border p-2">IP Address</th>
        </tr>
      </thead>
      <tbody>
        {channels.map((c) => (
          <tr key={c.id}>
            <td className="border p-2">{c.id}</td>
            <td className="border p-2">{c.agencyName}</td>
            <td className="border p-2">{c.provider}</td>
            <td className="border p-2">{c.bandwidthKbps} Kbps</td>
            {showRegion && <td className="border p-2">{c.region}</td>}
            <td className="border p-2">{c.ipAddress}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
