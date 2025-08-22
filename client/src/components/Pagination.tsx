import React from "react";

interface Props {
  page: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
}

export default function Pagination({ page, perPage, total, onPageChange, onPerPageChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const perPageOptions = [10, 25, 50, 100];
  return (
    <div className="mt-4 flex flex-wrap items-center gap-4">
      <button
        className="px-3 py-1 border rounded"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Prev
      </button>
      <span>
        Page {page} of {totalPages}
      </span>
      <button
        className="px-3 py-1 border rounded"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
      {onPerPageChange && (
        <select
          value={perPage}
          onChange={(e) => onPerPageChange(Number(e.target.value))}
          className="border rounded p-1"
        >
          {perPageOptions.map((n) => (
            <option key={n} value={n}>
              {n} / page
            </option>
          ))}
        </select>
      )}
    </div>
  );
}