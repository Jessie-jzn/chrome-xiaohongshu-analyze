import { useState, useEffect, useCallback } from "react";
import { analyzeData } from "@/services/analyzer";
import { useStorage } from "./useStorage";

export function useAnalysis(initialData) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { saveToStorage, loadFromStorage } = useStorage();

  const analyze = useCallback(async (rawData) => {
    try {
      setLoading(true);
      const result = await analyzeData(rawData);
      setData(result);
      await saveToStorage("lastAnalysis", result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, analyze };
}
