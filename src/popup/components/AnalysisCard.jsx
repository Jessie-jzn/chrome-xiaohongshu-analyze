import React from "react";

export const AnalysisCard = ({ title, items }) => (
  <div className="bg-white rounded-lg shadow p-4">
    <h4 className="text-lg font-bold mb-2">{title}</h4>
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex justify-between items-center">
          <span className="text-gray-500">{item.label}</span>
          <span className="font-medium">{item.value}</span>
        </div>
      ))}
    </div>
  </div>
);
