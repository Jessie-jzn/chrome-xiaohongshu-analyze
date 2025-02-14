import { useCallback } from "react";

export const useStorage = () => {
  const saveToStorage = useCallback(async (key, data) => {
    try {
      await chrome.storage.local.set({ [key]: data });
    } catch (err) {
      console.error("Storage save failed:", err);
    }
  }, []);

  const loadFromStorage = useCallback(async (key) => {
    try {
      const result = await chrome.storage.local.get(key);
      return result[key];
    } catch (err) {
      console.error("Storage load failed:", err);
      return null;
    }
  }, []);

  return { saveToStorage, loadFromStorage };
};
