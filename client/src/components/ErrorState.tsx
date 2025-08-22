import React from "react";

interface Props {
  message?: string;
}

export default function ErrorState({ message = "Something went wrong" }: Props) {
  return (
    <div className="p-4 text-center text-red-500">{message}</div>
  );
}