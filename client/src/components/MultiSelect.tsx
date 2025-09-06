import React from "react";

interface Option {
  value: string;
  label: string;
}

interface Props {
  name: string;
  label: string;
  options: Option[];
  values: string[];
  onChange: (values: string[]) => void;
}

export default function MultiSelect({
  name,
  label,
  options,
  values,
  onChange,
}: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
    onChange(selected);
  };

  return (
    <div>
      <label className="block text-sm font-semibold" htmlFor={name}>
        {label}
      </label>
      <select
        multiple
        id={name}
        className="border px-2 py-1 rounded min-w-[150px]"
        value={values}
        onChange={handleChange}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}