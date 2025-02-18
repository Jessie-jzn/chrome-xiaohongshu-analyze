import { analyzeKeywords } from "./keyword";
import { predictHotPosts } from "./predictor";
import { analyzeInfluencerPosition } from "./influencer";

export const analyzeData = (data) => {
  const stats = calculateStats(data);
  const titleAnalysis = analyzeTitles(data);
  const keywordAnalysis = analyzeKeywords(data);
  const hotPredictions = predictHotPosts(data);
  const influencerAnalysis = analyzeInfluencerPosition(data);

  return {
    stats,
    titleAnalysis,
    keywordAnalysis,
    hotPredictions,
    influencerAnalysis,
  };
};

function calculateStats(data) {
  if (!Array.isArray(data)) {
    return {
      totalNotes: 0,
      avgLikes: 0,
      videoCount: 0,
      imageCount: 0,
    };
  }

  const totalNotes = data.length;
  const totalLikes = data.reduce((sum, note) => sum + note.likes, 0);
  const avgLikes = totalLikes / totalNotes;
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
  const titles = data.map((note) => note.title);
  const totalLength = titles.reduce((sum, title) => sum + title.length, 0);
  const avgLength = totalLength / titles.length;

  return {
    avgLength,
    patterns: {
      hasNumber:
        (titles.filter((title) => /\d+/.test(title)).length / titles.length) *
        100,
      hasEmoji:
        (titles.filter((title) => /[\u{1F300}-\u{1F9FF}]/u.test(title)).length /
          titles.length) *
        100,
    },
  };
}
