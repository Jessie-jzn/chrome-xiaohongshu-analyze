export const saveAnalysisResult = async (data) => {
  try {
    await chrome.storage.local.set({ lastAnalysis: data });
  } catch (err) {
    console.error("Failed to save analysis:", err);
  }
};

export const loadHistory = async () => {
  try {
    const result = await chrome.storage.local.get("lastAnalysis");
    return result.lastAnalysis;
  } catch (err) {
    console.error("Failed to load history:", err);
    return null;
  }
};
