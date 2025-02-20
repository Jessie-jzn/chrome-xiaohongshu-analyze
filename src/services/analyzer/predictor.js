// 计算时间衰减因子
function calculateTimeDecay(timestamp) {
  const now = Date.now();
  const age = now - (timestamp || now);
  const dayInMs = 24 * 60 * 60 * 1000;
  return Math.exp(-age / dayInMs);
}

// 计算互动率
function calculateEngagementRate(likes, baseValue) {
  return (likes || 0) / baseValue;
}

// 预测爆文潜力
export function predictHotPosts(posts) {
  if (!Array.isArray(posts) || posts.length === 0) {
    return [];
  }

  return posts
    .map((post) => {
      try {
        const engagementRate = calculateEngagementRate(post.likes || 0, 1000);
        const timeDecay = calculateTimeDecay(post.timestamp || Date.now());
        const contentBonus = post.isVideo ? 1.2 : 1;
        const titleScore = calculateTitleScore(post.title);

        const hotScore = engagementRate * timeDecay * contentBonus * titleScore;

        return {
          ...post,
          score: hotScore,
          prediction: {
            engagementRate,
            timeDecay,
            contentBonus,
            titleScore,
            potentialScore: Math.round(hotScore * 100),
          },
        };
      } catch (error) {
        console.error("Error processing post:", error);
        return null;
      }
    })
    .filter(Boolean) // 移除 null 值
    .sort((a, b) => b.score - a.score);
}

// 计算标题得分
function calculateTitleScore(title) {
  const factors = {
    hasNumber: /\d+/.test(title) ? 1.1 : 1,
    hasEmoji: /[\u{1F300}-\u{1F9FF}]/u.test(title) ? 1.1 : 1,
    length: Math.min(title.length / 15, 1.2), // 标题长度适中加分
    hasKeywords: containsHotKeywords(title) ? 1.2 : 1,
  };

  return Object.values(factors).reduce((a, b) => a * b, 1);
}

// 热门关键词检测
function containsHotKeywords(title) {
  const hotKeywords = [
    "必看",
    "推荐",
    "分享",
    "教程",
    "攻略",
    "技巧",
    "秘诀",
    "经验",
    "干货",
    "揭秘",
    "测评",
    "真相",
  ];

  return hotKeywords.some((keyword) => title.includes(keyword));
}
