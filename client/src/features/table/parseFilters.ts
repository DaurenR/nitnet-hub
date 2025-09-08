import type {
  ColumnFilter,
  NumberRangeFilter,
  DateRangeFilter,
  TextFilter,
} from "./types.ts";

const first = (v: unknown): string | undefined => {
  const raw = Array.isArray(v) ? v[0] : v;
  return raw === "" || raw == null ? undefined : String(raw);
};

const toNum = (v: unknown): number | undefined => {
  const raw = Array.isArray(v) ? v[0] : v;
  if (raw === "" || raw == null) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
};

export default function parseFilters(
  query: Record<string, string | string[] | undefined>
): ColumnFilter[] {
  const map: Record<string, ColumnFilter> = {};

  Object.entries(query).forEach(([key, value]) => {
    if (!key.startsWith("f_")) return;
    const raw = key.slice(2);
    const v = first(value);

    if (raw.endsWith("Min") || raw.endsWith("Max")) {
      const col = raw.replace(/(Min|Max)$/, "");
      let filter = map[col] as NumberRangeFilter | undefined;
      if (!filter) {
        filter = { column: col, type: "numberRange" };
        map[col] = filter;
      }
      if (raw.endsWith("Min")) filter.min = toNum(value);
      else filter.max = toNum(value);
      return;
    }

    if (raw.endsWith("From") || raw.endsWith("To")) {
      const col = raw.replace(/(From|To)$/, "");
      let filter = map[col] as DateRangeFilter | undefined;
      if (!filter) {
        filter = { column: col, type: "dateRange" };
        map[col] = filter;
      }
      if (raw.endsWith("From")) filter.from = v;
      else filter.to = v;
      return;
    }

    const col = raw;
    const filter = (map[col] as TextFilter) || {
      column: col,
      type: "text",
    };
    const arr = Array.isArray(value) ? value : v !== undefined ? [v] : [];
    if (arr.length > 0) {
      filter.value = Array.isArray(filter.value)
        ? [...filter.value, ...arr]
        : arr;
      map[col] = filter;
    }
  });

  return Object.values(map);
}
