// 停用词表
const stopWords = new Set([
  "的",
  "了",
  "和",
  "与",
  "或",
  "在",
  "是",
  "都",
  "而",
  "及",
  "等",
  "着",
  "把",
  "被",
  "让",
  "但",
  "去",
  "来",
  "又",
  "也",
  "很",
  "好",
  "这",
  "那",
  "就",
  "才",
  "跟",
  "做",
  "看",
  "给",
  "用",
  "找",
  "像",
  "说",
  "要",
  "把",
  "会",
  "有",
  "个",
  "吧",
  "啊",
  "呢",
  "吗",
  "了",
  "哦",
  "哈",
  "啦",
  "呀",
]);

// 关键词分析
export function analyzeKeywords(contents) {
  const wordMap = new Map();

  contents.forEach((text) => {
    // 使用正则分词（简单实现，实际项目建议使用专业分词库）
    const words = text.match(/[\u4e00-\u9fa5]{2,}/g) || [];

    words
      .filter((w) => !stopWords.has(w))
      .forEach((w) => wordMap.set(w, (wordMap.get(w) || 0) + 1));
  });

  return Array.from(wordMap.entries())
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 50);
}

// 计算标题相似度
export function calculateTitleSimilarity(title1, title2) {
  const words1 = new Set(title1.match(/[\u4e00-\u9fa5]{2,}/g) || []);
  const words2 = new Set(title2.match(/[\u4e00-\u9fa5]{2,}/g) || []);

  const intersection = new Set([...words1].filter((x) => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}
