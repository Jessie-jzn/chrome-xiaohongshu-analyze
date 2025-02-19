import { useState, useCallback } from "react";
import { analyzeData } from "@/services/analyzer";
import { useStorage } from "./useStorage";

export function useAnalysis() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { saveToStorage, loadFromStorage } = useStorage();

  const analyze = useCallback(
    async (count = 50) => {
      try {
        setLoading(true);
        setError(null);

        // 获取当前标签页
        const tabs = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        const tab = tabs[0];

        if (!tab?.id) {
          throw new Error("未找到活动标签页");
        }

        if (!tab.url?.includes("xiaohongshu.com")) {
          throw new Error("请在小红书网页上使用此插件");
        }
        

        // 发送消息获取数据
        const response = await chrome.tabs.sendMessage(tab.id, {
          action: "extract",
          count,
        });

        if (response.error) {
          throw new Error(response.error);
        }

        if (!Array.isArray(response?.data)) {
          throw new Error(
            "未能获取笔记数据，请确保在小红书笔记列表页面使用此插件"
          );
        }

        if (response.data.length === 0) {
          throw new Error("未找到任何笔记数据，请确保页面已完全加载");
        }

        console.log("Analyzing data:", response.data);
        const analysisResult = analyzeData(response.data);
        setData(analysisResult);
        await saveToStorage("lastAnalysis", analysisResult);

        return analysisResult;
      } catch (err) {
        console.error("Analysis failed:", err);
        setError(err.message || "分析失败");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [saveToStorage]
  );

  return { data, loading, error, analyze };
}
