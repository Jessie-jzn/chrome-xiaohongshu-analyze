// 存储相关功能
export async function saveAnalysisResult(data) {
  try {
    const newRecord = createAnalysisRecord(data);
    await saveToStorage(newRecord);
  } catch (error) {
    console.error("保存分析结果失败:", error);
  }
}

export async function loadHistory() {
  try {
    const result = await chrome.storage.local.get("analysisHistory");
    return result.analysisHistory || [];
  } catch (error) {
    console.error("加载历史记录失败:", error);
    return [];
  }
}

function createAnalysisRecord(data) {
  return {
    id: generateId(),
    timestamp: new Date().toISOString(),
    data: data,
    analysis: analyzeData(data),
  };
}

async function saveToStorage(record) {
  try {
    // 获取现有历史记录
    const { analysisHistory = [] } = await chrome.storage.local.get(
      "analysisHistory"
    );

    // 添加新记录到开头
    analysisHistory.unshift(record);

    // 保留最近的10条记录
    const updatedHistory = analysisHistory.slice(0, 10);

    // 保存更新后的历史记录
    await chrome.storage.local.set({ analysisHistory: updatedHistory });

    // 保存最后一次分析结果
    await chrome.storage.local.set({
      lastAnalysis: { timestamp: record.timestamp, data: record.data },
    });
  } catch (error) {
    console.error("保存到存储失败:", error);
    throw error;
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export async function deleteRecord(recordId) {
  try {
    const { analysisHistory = [] } = await chrome.storage.local.get(
      "analysisHistory"
    );
    const updatedHistory = analysisHistory.filter(
      (record) => record.id !== recordId
    );
    await chrome.storage.local.set({ analysisHistory: updatedHistory });
    return true;
  } catch (error) {
    console.error("删除记录失败:", error);
    return false;
  }
}

export async function clearHistory() {
  try {
    await chrome.storage.local.remove(["analysisHistory", "lastAnalysis"]);
    return true;
  } catch (error) {
    console.error("清除历史记录失败:", error);
    return false;
  }
}

// ... 其他存储相关函数 ...
