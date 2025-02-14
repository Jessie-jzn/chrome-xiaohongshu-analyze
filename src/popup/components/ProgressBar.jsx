import React from "react";

export const ProgressBar = ({ progress = 0 }) => (
  <div className="mt-4 bg-gray-200 rounded overflow-hidden">
    <div
      className="h-2 bg-primary transition-all duration-300"
      style={{ width: `${progress}%` }}
    />
  </div>
);
