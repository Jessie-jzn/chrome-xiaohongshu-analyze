// 数据分析相关功能
export function analyzeData(data) {
  return {
    stats: calculateStats(data),
    topAuthors: analyzeAuthors(data),
    topKeywords: analyzeKeywords(data),
    likesDistribution: analyzeLikesDistribution(data),
    titleAnalysis: analyzeTitles(data),
  };
}

function calculateStats(data) {
  return {
    totalNotes: data.length,
    totalLikes: data.reduce((sum, note) => sum + note.likesNum, 0),
    avgLikes: Math.round(
      data.reduce((sum, note) => sum + note.likesNum, 0) / data.length
    ),
    videoCount: data.filter((note) => note.isVideo).length,
    imageCount: data.filter((note) => !note.isVideo).length,
    maxLikes: data[0]?.likesNum || 0,
    minLikes: data[data.length - 1]?.likesNum || 0,
  };
}

function analyzeAuthors(data) {
  // 统计作者发文数量和总点赞
  const authorStats = {};
  data.forEach((note) => {
    if (!authorStats[note.author]) {
      authorStats[note.author] = {
        noteCount: 0,
        totalLikes: 0,
        avgLikes: 0,
      };
    }
    authorStats[note.author].noteCount++;
    authorStats[note.author].totalLikes += note.likesNum;
  });

  // 计算平均点赞并排序
  Object.values(authorStats).forEach((stats) => {
    stats.avgLikes = Math.round(stats.totalLikes / stats.noteCount);
  });

  return Object.entries(authorStats)
    .sort(([, a], [, b]) => b.avgLikes - a.avgLikes)
    .slice(0, 10)
    .map(([author, stats]) => ({
      author,
      ...stats,
    }));
}

function analyzeKeywords(data) {
  // 分词并统计频率
  const keywords = {};
  const stopWords = new Set([
    "的",
    "了",
    "和",
    "与",
    "或",
    "在",
    "是",
    "都",
    "也",
  ]);

  data.forEach((note) => {
    const words = note.title
      .split(/[\s,，.。!！?？:：;；()（）【】\[\]]/g)
      .filter((word) => word.length >= 2 && !stopWords.has(word));

    words.forEach((word) => {
      if (!keywords[word]) {
        keywords[word] = {
          count: 0,
          totalLikes: 0,
          avgLikes: 0,
        };
      }
      keywords[word].count++;
      keywords[word].totalLikes += note.likesNum;
    });
  });

  // 计算平均点赞并排序
  Object.values(keywords).forEach((stats) => {
    stats.avgLikes = Math.round(stats.totalLikes / stats.count);
  });

  return Object.entries(keywords)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 20)
    .map(([keyword, stats]) => ({
      keyword,
      ...stats,
    }));
}

function analyzeLikesDistribution(data) {
  const distribution = {
    "0-100": 0,
    "100-500": 0,
    "500-1000": 0,
    "1000-5000": 0,
    "5000-10000": 0,
    "10000+": 0,
  };

  data.forEach((note) => {
    const likes = note.likesNum;
    if (likes < 100) distribution["0-100"]++;
    else if (likes < 500) distribution["100-500"]++;
    else if (likes < 1000) distribution["500-1000"]++;
    else if (likes < 5000) distribution["1000-5000"]++;
    else if (likes < 10000) distribution["5000-10000"]++;
    else distribution["10000+"]++;
  });

  return distribution;
}

function analyzeTitles(data) {
  const titleLengths = data.map((note) => note.title.length);
  const avgLength = Math.round(
    titleLengths.reduce((sum, len) => sum + len, 0) / titleLengths.length
  );

  // 分析标题特征
  const patterns = {
    hasNumber: /\d+/,
    hasEmoji: /[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27FF]|[\u2300-\u23FF]/,
    hasQuestion: /[?？]/,
    hasExclamation: /[!！]/,
    hasBrackets: /[【】\[\]（）()]/,
  };

  const features = {
    avgLength,
    patterns: Object.entries(patterns).reduce((acc, [key, regex]) => {
      const count = data.filter((note) => regex.test(note.title)).length;
      acc[key] = Math.round((count / data.length) * 100);
      return acc;
    }, {}),
  };

  return features;
}
