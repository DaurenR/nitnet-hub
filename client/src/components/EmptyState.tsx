import React from "react";

interface Props {
  message?: string;
}

export default function EmptyState({ message = "No records found" }: Props) {
  return (
    <div className="p-4 text-center text-gray-500">{message}</div>
  );
}