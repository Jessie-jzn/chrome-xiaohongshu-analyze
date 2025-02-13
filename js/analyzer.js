// 数据分析相关功能
export function analyzeData(data) {
  const stats = calculateStats(data);
  const topAuthors = findTopAuthors(data);
  const topKeywords = extractKeywords(data);
  const titleAnalysis = analyzeTitles(data);

  return {
    stats,
    topAuthors,
    topKeywords,
    titleAnalysis,
  };
}

// 计算基本统计数据
function calculateStats(data) {
  const totalNotes = data.length;
  const totalLikes = data.reduce((sum, note) => sum + note.likesNum, 0);
  const avgLikes = totalLikes / totalNotes;
  const videoCount = data.filter((note) => note.isVideo).length;
  const imageCount = totalNotes - videoCount;

  return {
    totalNotes,
    totalLikes,
    avgLikes,
    videoCount,
    imageCount,
  };
}

// 查找最活跃的作者
function findTopAuthors(data) {
  const authorStats = {};
  data.forEach((note) => {
    authorStats[note.author] = (authorStats[note.author] || 0) + 1;
  });

  return Object.entries(authorStats)
    .map(([author, count]) => ({ author, noteCount: count }))
    .sort((a, b) => b.noteCount - a.noteCount)
    .slice(0, 3);
}

// 提取关键词
function extractKeywords(data) {
  const keywords = {};
  const stopWords = new Set(["的", "了", "和", "与", "或", "在", "是"]);

  data.forEach((note) => {
    const words = note.title.split(/[\s,，.。!！?？]/);
    words.forEach((word) => {
      if (word && !stopWords.has(word)) {
        keywords[word] = (keywords[word] || 0) + 1;
      }
    });
  });

  return Object.entries(keywords)
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

// 分析标题
function analyzeTitles(data) {
  const titles = data.map((note) => note.title);
  const totalLength = titles.reduce((sum, title) => sum + title.length, 0);
  const avgLength = Math.round(totalLength / titles.length);

  const patterns = {
    hasNumber: calculatePercentage(titles, (title) => /\d+/.test(title)),
    hasEmoji: calculatePercentage(titles, (title) =>
      /[\u{1F300}-\u{1F9FF}]/u.test(title)
    ),
  };

  return {
    avgLength,
    patterns,
  };
}

// 计算百分比
function calculatePercentage(array, predicate) {
  const count = array.filter(predicate).length;
  return Math.round((count / array.length) * 100);
}
