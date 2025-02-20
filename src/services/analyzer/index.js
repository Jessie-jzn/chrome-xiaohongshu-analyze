import { predictHotPosts } from "./predictor";
import { analyzeInfluencerPosition } from "./influencer";

export const analyzeData = (data) => {
  const stats = calculateStats(data);
  const titleAnalysis = analyzeTitles(data);
  const hotPredictions = predictHotPosts(data);
  const influencerAnalysis = analyzeInfluencerPosition(data);

  return {
    stats,
    titleAnalysis,
    hotPredictions,
    influencerAnalysis,
  };
};

function calculateStats(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return {
      totalNotes: 0,
      avgLikes: 0,
      videoCount: 0,
      imageCount: 0,
    };
  }

  const totalNotes = data.length;
  const totalLikes = data.reduce((sum, note) => sum + note.likes, 0);
  const avgLikes = totalNotes > 0 ? totalLikes / totalNotes : 0;
  const videoCount = data.filter((note) => note.isVideo).length;
  const imageCount = totalNotes - videoCount;

  return {
    totalNotes,
    avgLikes,
    videoCount,
    imageCount,
  };
}

function analyzeTitles(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return {
      avgLength: 0,
      patterns: {
        hasNumber: 0,
        hasEmoji: 0,
      },
    };
  }

  const titles = data.map((note) => note.title || "");
  const totalLength = titles.reduce((sum, title) => sum + title.length, 0);
  const avgLength = titles.length > 0 ? totalLength / titles.length : 0;

  const hasNumberCount = titles.filter((title) => /\d+/.test(title)).length;
  const hasEmojiCount = titles.filter((title) =>
    /[\u{1F300}-\u{1F9FF}]/u.test(title)
  ).length;

  return {
    avgLength,
    patterns: {
      hasNumber: Number(((hasNumberCount / titles.length) * 100).toFixed(2)),
      hasEmoji: Number(((hasEmojiCount / titles.length) * 100).toFixed(2)),
    },
  };
}
