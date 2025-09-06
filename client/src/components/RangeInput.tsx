import React from "react";

interface Props {
  label: string;
  minName: string;
  maxName: string;
  minValue?: string;
  maxValue?: string;
  onChange: (name: string, value: string) => void;
}

export default function RangeInput({
  label,
  minName,
  maxName,
  minValue,
  maxValue,
  onChange,
}: Props) {
  return (
    <div>
      <label className="block text-sm font-semibold">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={minValue || ""}
          onChange={(e) => onChange(minName, e.target.value)}
          className="border px-2 py-1 rounded w-24"
          placeholder="Min"
        />
        <span>-</span>
        <input
          type="number"
          value={maxValue || ""}
          onChange={(e) => onChange(maxName, e.target.value)}
          className="border px-2 py-1 rounded w-24"
          placeholder="Max"
        />
      </div>
    </div>
  );
}