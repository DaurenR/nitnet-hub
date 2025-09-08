export interface TextFilter {
  column: string;
  value: string | string[] | undefined;
  type?: "text";
}

export interface NumberRangeFilter {
  column: string;
  type: "numberRange";
  min?: number;
  max?: number;
}

export interface DateRangeFilter {
  column: string;
  type: "dateRange";
  from?: string;
  to?: string;
}

export type ColumnFilter =
  | TextFilter
  | NumberRangeFilter
  | DateRangeFilter;