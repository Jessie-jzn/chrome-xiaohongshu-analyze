import React from "react";

export const StatsCard = ({ title, value, icon }) => (
  <div className="bg-white rounded-lg shadow p-4">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-bold">{value}</h3>
        <p className="text-gray-500">{title}</p>
      </div>
      <div className="text-2xl">{icon}</div>
    </div>
  </div>
);

const StatItem = ({ label, value }) => (
  <div className="text-center">
    <div className="text-2xl font-bold text-primary">{value}</div>
    <div className="text-sm text-gray-600">{label}</div>
  </div>
);
