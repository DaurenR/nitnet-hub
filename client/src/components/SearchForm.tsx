import React, { useEffect, useRef, useState } from "react";

const SEARCH_DEBOUNCE_MS = 350;

interface Field {
  name: string;
  label: string;
  defaultValue?: string;
}

interface Props {
  fields: Field[];
  onSearch: (values: Record<string, string>) => void;
}

export default function SearchForm({ fields, onSearch }: Props) {
  const [values, setValues] = useState<Record<string, string>>(
    () => Object.fromEntries(fields.map((f) => [f.name, f.defaultValue || ""]))
  );

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    const timer = window.setTimeout(() => onSearch(values), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [values, onSearch]);

  return (
    <div className="mb-6 flex gap-4 items-end">
      {fields.map((field) => (
        <div key={field.name}>
          <label className="block text-sm font-semibold">{field.label}</label>
          <input
            type="text"
            value={values[field.name]}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className="border px-3 py-1 rounded"
          />
        </div>
      ))}
      <button
        onClick={() => onSearch(values)}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Search
      </button>
    </div>
  );
}
