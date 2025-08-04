import React, { useState } from "react";

interface Props {
  provider?: string;
  agency?: string;
  region?: string;
  onSearch: (provider: string, agency: string, region: string) => void;
}

export default function SearchForm({
  provider = "",
  agency = "",
  region = "",
  onSearch,
}: Props) {
  const [providerInput, setProviderInput] = useState(provider);
  const [agencyInput, setAgencyInput] = useState(agency);
  const [regionInput, setRegionInput] = useState(region);

  return (
    <div className="mb-6 flex gap-4 items-end">
      <div>
        <label className="block text-sm font-semibold">Provider</label>
        <input
          type="text"
          value={providerInput}
          onChange={(e) => setProviderInput(e.target.value)}
          className="border px-3 py-1 rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold">Agency</label>
        <input
          type="text"
          value={agencyInput}
          onChange={(e) => setAgencyInput(e.target.value)}
          className="border px-3 py-1 rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold">Region</label>
        <input
          type="text"
          value={regionInput}
          onChange={(e) => setRegionInput(e.target.value)}
          className="border px-3 py-1 rounded"
        />
      </div>
      <button
        onClick={() => onSearch(providerInput, agencyInput, regionInput)}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Search
      </button>
    </div>
  );
}
