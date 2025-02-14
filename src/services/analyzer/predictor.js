// 计算时间衰减因子
function calculateTimeDecay(timestamp) {
  const now = Date.now();
  const age = (now - new Date(timestamp).getTime()) / (24 * 60 * 60 * 1000); // 天数
  return Math.exp(-age / 30); // 30天半衰期
}

// 计算互动率
function calculateEngagementRate(likes, followers) {
  return likes / (followers || 1000); // 默认1000粉丝
}

// 预测爆文潜力
export function predictHotPosts(posts) {
  return posts
    .map((post) => {
      const engagementRate = calculateEngagementRate(post.likesNum, 1000);
      const timeDecay = calculateTimeDecay(post.timestamp);
      const contentBonus = post.isVideo ? 1.2 : 1; // 视频内容加成
      const titleScore = calculateTitleScore(post.title);

      const hotScore = engagementRate * timeDecay * contentBonus * titleScore;

      return {
        ...post,
        hotScore,
        prediction: {
          engagementRate,
          timeDecay,
          contentBonus,
          titleScore,
          potentialScore: Math.round(hotScore * 100),
        },
      };
    })
    .sort((a, b) => b.hotScore - a.hotScore);
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
