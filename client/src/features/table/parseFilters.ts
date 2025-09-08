import type {
  ColumnFilter,
  NumberRangeFilter,
  DateRangeFilter,
  TextFilter,
} from "./types.ts";

const first = (v: string | string[] | undefined): string | undefined =>
  Array.isArray(v) ? v[0] : v;

const toNum = (v: string | undefined): number | undefined => {
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
};

export default function parseFilters(
  query: Record<string, string | string[] | undefined>,
): ColumnFilter[] {
  const map: Record<string, ColumnFilter> = {};

  Object.entries(query).forEach(([key, value]) => {
    if (!key.startsWith("f_")) return;
    const raw = key.slice(2);
    const v = first(value);

    if (raw.endsWith("Min") || raw.endsWith("Max")) {
      const col = raw.replace(/(Min|Max)$/, "");
      const filter = (map[col] as NumberRangeFilter) || {
        column: col,
        type: "numberRange",
      };
      if (raw.endsWith("Min")) filter.min = toNum(v);
      else filter.max = toNum(v);
      map[col] = filter;
      return;
    }

    if (raw.endsWith("From") || raw.endsWith("To")) {
      const col = raw.replace(/(From|To)$/, "");
      const filter = (map[col] as DateRangeFilter) || {
        column: col,
        type: "dateRange",
      };
      if (raw.endsWith("From")) filter.from = v;
      else filter.to = v;
      map[col] = filter;
      return;
    }

    const col = raw;
    const filter = (map[col] as TextFilter) || {
      column: col,
      type: "text",
      value: [],
    };
    const arr = Array.isArray(value)
      ? value
      : v !== undefined
      ? [v]
      : [];
    filter.value = Array.isArray(filter.value)
      ? [...filter.value, ...arr]
      : arr;
    map[col] = filter;
  });

  return Object.values(map);
}