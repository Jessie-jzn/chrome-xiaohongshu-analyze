import React, { useState, useEffect } from "react";
import { useStorage } from "../hooks/useStorage";
import { DataTable } from "./DataTable";

export const HistoryTab = () => {
  const [history, setHistory] = useState([]);
  const { loadFromStorage } = useStorage();

  useEffect(() => {
    const loadHistory = async () => {
      const lastAnalysis = await loadFromStorage("lastAnalysis");
      if (lastAnalysis) {
        setHistory([lastAnalysis]);
      }
    };

    loadHistory();
  }, [loadFromStorage]);

  if (!history.length) {
    return <div className="text-center text-gray-500 py-8">暂无历史记录</div>;
  }

  return (
    <div className="space-y-4">
      {history.map((item, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-bold mb-2">
            分析记录 {new Date().toLocaleDateString()}
          </h3>
          <DataTable data={item.stats} />
        </div>
      ))}
    </div>
  );
};
