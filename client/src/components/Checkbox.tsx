import React from "react";

interface Props {
  name: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function Checkbox({ name, label, checked, onChange }: Props) {
  return (
    <label className="inline-flex items-center gap-2" htmlFor={name}>
      <input
        id={name}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="border rounded"
      />
      <span className="text-sm font-semibold">{label}</span>
    </label>
  );
}