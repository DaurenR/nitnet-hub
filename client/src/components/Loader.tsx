import React from "react";

export default function Loader() {
  return (
    <div className="flex justify-center p-4">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-transparent" />
    </div>
  );
}