import React from "react";

interface Props {
  label: string;
  fromName: string;
  toName: string;
  fromValue?: string;
  toValue?: string;
  onChange: (name: string, value: string) => void;
}

export default function DateRange({
  label,
  fromName,
  toName,
  fromValue,
  toValue,
  onChange,
}: Props) {
  return (
    <div>
      <label className="block text-sm font-semibold">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={fromValue || ""}
          onChange={(e) => onChange(fromName, e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <span>-</span>
        <input
          type="date"
          value={toValue || ""}
          onChange={(e) => onChange(toName, e.target.value)}
          className="border px-2 py-1 rounded"
        />
      </div>
    </div>
  );
}