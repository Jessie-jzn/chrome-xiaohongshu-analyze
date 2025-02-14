import React, { useState } from "react";
import { AnalysisCard } from "./components/AnalysisCard";
import { DataTable } from "./components/DataTable";
import { ProgressBar } from "./components/ProgressBar";
import { useAnalysis } from "./hooks/useAnalysis";
import { exportToExcel } from "../utils/export";
import { OverviewTab } from "./components/OverviewTab";
import { ChartsTab } from "./components/ChartsTab";
import { HistoryTab } from "./components/HistoryTab";

function App() {
  const [noteCount, setNoteCount] = useState(50);
  const { data, loading, error, analyze } = useAnalysis();
  const [activeTab, setActiveTab] = useState("overview");

  const handleAnalyze = async () => {
    try {
      await analyze(noteCount);
    } catch (err) {
      console.error("Analysis failed:", err);
      setError(err.message || "分析失败，请确保在小红书页面使用此插件");
    }
  };

  const handleExport = () => {
    if (data) {
      exportToExcel(data);
    }
  };

  return (
    <div className="p-4">
      <div className="input-group mb-4">
        <select
          className="w-full p-2 border rounded"
          value={noteCount}
          onChange={(e) => setNoteCount(Number(e.target.value))}
        >
          <option value={10}>10篇</option>
          <option value={20}>20篇</option>
          <option value={30}>30篇</option>
          <option value={50}>50篇</option>
        </select>
      </div>

      <button
        className="w-full p-2 bg-primary text-white rounded hover:bg-primary-dark"
        onClick={handleAnalyze}
        disabled={loading}
      >
        {loading ? "分析中..." : "开始分析"}
      </button>

      <button
        className="w-full p-2 mt-2 bg-green-500 text-white rounded hover:bg-green-600"
        onClick={handleExport}
        disabled={!data}
      >
        📊 导出数据表格
      </button>

      {loading && <ProgressBar />}

      {error && (
        <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {data && (
        <div className="mt-4">
          <div className="tabs flex gap-2 mb-4">
            <TabButton
              active={activeTab === "overview"}
              onClick={() => setActiveTab("overview")}
              icon="📊"
              label="概览"
            />
            <TabButton
              active={activeTab === "charts"}
              onClick={() => setActiveTab("charts")}
              icon="📈"
              label="图表"
            />
            <TabButton
              active={activeTab === "history"}
              onClick={() => setActiveTab("history")}
              icon="📋"
              label="历史"
            />
          </div>

          {activeTab === "overview" && <OverviewTab data={data} />}
          {activeTab === "charts" && <ChartsTab data={data} />}
          {activeTab === "history" && <HistoryTab />}
        </div>
      )}
    </div>
  );
}

const TabButton = ({ active, onClick, icon, label }) => (
  <button
    className={`flex-1 p-2 rounded ${
      active ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
    }`}
    onClick={onClick}
  >
    {icon} {label}
  </button>
);

export default App;
