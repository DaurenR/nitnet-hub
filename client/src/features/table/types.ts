export type TextFilter = {
  type: 'text';
  column: string;
  value?: string | string[];
};

export type NumberRangeFilter = {
  type: 'numberRange';
  column: string;
  min?: number;
  max?: number;
}

export type DateRangeFilter = {
  type: 'dateRange';
  column: string;
  from?: string;
  to?: string;
}

export type ColumnFilter =
  | TextFilter
  | NumberRangeFilter
  | DateRangeFilter;