import React from "react";

interface Props {
  page: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, perPage, total, onPageChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  return (
    <div className="mt-4 flex items-center gap-4">
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
    </div>
  );
}