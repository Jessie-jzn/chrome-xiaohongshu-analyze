// 博主360度定位分析模型
export function analyzeInfluencerPosition(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return {
      type: "unknown",
      score: 0,
      recommendations: [],
    };
  }

  try {
    const avgLikes = calculateAvgLikes(data);
    const contentDiversity = calculateContentDiversity(data);
    const postFrequency = calculatePostFrequency(data);

    return {
      type: determineInfluencerType(avgLikes, contentDiversity),
      score: calculateInfluencerScore(
        avgLikes,
        contentDiversity,
        postFrequency
      ),
      recommendations: generateRecommendations(
        avgLikes,
        contentDiversity,
        postFrequency
      ),
    };
  } catch (error) {
    console.error("Error analyzing influencer position:", error);
    return {
      type: "unknown",
      score: 0,
      recommendations: [],
    };
  }
}

function calculateAvgLikes(data) {
  return data.reduce((sum, post) => sum + (post.likes || 0), 0) / data.length;
}

function calculateContentDiversity(data) {
  const videoCount = data.filter((post) => post.isVideo).length;
  return videoCount / data.length;
}

function calculatePostFrequency(data) {
  // 简化版本，实际应该基于时间戳计算
  return data.length;
}

function determineInfluencerType(avgLikes, contentDiversity) {
  if (avgLikes > 5000) return "KOL";
  if (avgLikes > 1000) return "微影响力";
  return "普通用户";
}

function calculateInfluencerScore(avgLikes, contentDiversity, postFrequency) {
  return (avgLikes * 0.5 + contentDiversity * 0.3 + postFrequency * 0.2) / 100;
}

function generateRecommendations(avgLikes, contentDiversity, postFrequency) {
  const recommendations = [];

  if (avgLikes < 1000) {
    recommendations.push("提高内容质量以增加互动");
  }
  if (contentDiversity < 0.3) {
    recommendations.push("尝试更多样化的内容形式");
  }
  if (postFrequency < 3) {
    recommendations.push("增加发布频率");
  }

  return recommendations;
}

// 1. 输出内容分析
function analyzeContent(data) {
  // 提取主要话题
  const topics = data.map((note) => note.title).join(" ");
  const mainTopics = extractKeywords(topics, 5);

  // 分析内容风格
  const contentStyle = analyzeContentStyle(data);

  // 分析目标受众
  const targetAudience = {
    description: "25-35岁都市白领女性，关注个人成长与生活品质",
    tags: ["都市女性", "职场人士", "品质生活", "个人成长"],
  };

  return {
    mainTopics,
    contentStyle,
    valueProposition: "分享职场成长与品质生活",
    targetAudience,
    contentMatrix: {
      knowledge: 30,
      lifestyle: 40,
      entertainment: 30,
    },
  };
}

// 2. 身份角色分析
function analyzeRole(data) {
  return {
    profession: "自媒体博主",
    expertise: ["职场成长", "生活方式", "个人品牌"],
    socialRole: "意见领袖",
    personalBrand: {
      positioning: "职场生活分享博主",
      style: "专业知性",
    },
  };
}

// 3. 呈现形式分析
function analyzeStyle(data) {
  const videoCount = data.filter((note) => note.isVideo).length;
  const imageCount = data.length - videoCount;

  return {
    visualStyle: {
      videoRatio: Math.round((videoCount / data.length) * 100),
      imageRatio: Math.round((imageCount / data.length) * 100),
      mainStyle: videoCount > imageCount ? "视频为主" : "图文为主",
    },
    languageStyle: analyzeLanguageStyle(data),
    interactionStyle: "互动积极型",
    formatPreference: videoCount > imageCount ? "偏好视频" : "偏好图文",
  };
}

// 4. 人格调性分析
function analyzePersonality(data) {
  return {
    traits: ["专业", "真诚", "亲和力强"],
    tone: "专业知性",
    values: ["成长", "分享", "价值"],
    emotionalStyle: "积极正向",
  };
}

// 5. 变现路径分析
function analyzeMonetization(data) {
  const avgLikes =
    data.reduce((sum, note) => sum + note.likesNum, 0) / data.length;

  return {
    commercialValue: calculateCommercialScore(avgLikes),
    monetizationChannels: [
      { name: "品牌合作", percentage: 40 },
      { name: "课程变现", percentage: 30 },
      { name: "咨询服务", percentage: 20 },
      { name: "电商带货", percentage: 10 },
    ],
    businessModel: "IP变现+知识付费",
    growthPotential: "高",
  };
}

// 辅助函数
function extractKeywords(text, limit = 5) {
  const words = text?.match(/[\u4e00-\u9fa5]{2,}/g) || [];
  const wordCount = {};
  words.forEach((word) => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

function analyzeContentStyle(data) {
  const hasNumbers = data.filter((note) => /\d+/.test(note.title)).length;
  const hasEmoji = data.filter((note) =>
    /[\u{1F300}-\u{1F9FF}]/u.test(note.title)
  ).length;

  return {
    type: hasNumbers > data.length / 2 ? "干货型" : "体验型",
    format: hasEmoji > data.length / 2 ? "轻松活泼" : "严谨专业",
    structure: "清晰有序",
  };
}

function analyzeLanguageStyle(data) {
  const titles = data.map((note) => note.title);
  const hasQuestion = titles.filter((title) => /[？?]/.test(title)).length;
  const hasExclamation = titles.filter((title) => /[！!]/.test(title)).length;

  return {
    tone: hasQuestion > data.length / 3 ? "互动引导型" : "陈述分享型",
    emotion: hasExclamation > data.length / 3 ? "感性活力型" : "理性专业型",
    style: "亲和专业",
  };
}

function calculateCommercialScore(avgLikes) {
  // 根据平均点赞数计算商业价值评分
  if (avgLikes >= 10000) return 90;
  if (avgLikes >= 5000) return 80;
  if (avgLikes >= 1000) return 70;
  return Math.round((avgLikes / 1000) * 60);
}

// 6. 记忆点分析
function analyzeUniquePoints(data) {
  return {
    uniqueFeatures: {
      contentFeatures: ["专业深度", "实用性强", "案例丰富"],
      styleFeatures: ["表达清晰", "逻辑严谨", "互动性强"],
      personalFeatures: ["经验丰富", "观点独到", "亲和力强"],
    },
    corePerspectives: {
      mainIdeas: ["成长思维", "专业发展", "效率提升"],
      keyMessages: ["持续学习", "方法论", "实践验证"],
      uniqueAngles: ["理论结合实践", "数据支持", "案例分析"],
    },
    memorableElements: {
      visualElements: ["个人品牌色", "统一视觉风格", "专业形象"],
      contentElements: ["干货密度", "实用建议", "互动设计"],
      interactionElements: ["回复风格", "社群氛围", "活动形式"],
    },
    brandAssets: {
      coreValues: ["专业", "真诚", "价值"],
      visualIdentity: ["形象统一", "风格明确"],
      contentStyle: ["结构化", "易理解", "可执行"],
      communityBuilding: ["粉丝粘性", "互动频率", "社群活跃度"],
    },
  };
}

// 7. 对标选择分析
function analyzeBenchmark(data) {
  if (!data || !data.notes || data.notes.length === 0) {
    return {
      error: "数据为空，无法进行分析",
    };
  }

  // 计算平均点赞数
  const totalLikes = data.notes.reduce(
    (sum, note) => sum + parseInt(note.interact_info.liked_count, 10),
    0
  );
  const avgLikes = totalLikes / data.notes.length;

  // 定义市场定位
  function determineMarketPosition(avgLikes) {
    if (avgLikes > 10000) return "行业头部";
    if (avgLikes > 5000) return "领先";
    if (avgLikes > 1000) return "成长期";
    return "初级阶段";
  }

  return {
    competitors: {
      directCompetitors: [
        "同领域头部博主",
        "垂直领域专家",
        "行业意见领袖",
        "知识付费达人",
      ],
      indirectCompetitors: ["综合类博主", "跨领域创作者", "AI 驱动内容创作者"],
      internationalCompetitors: [
        "YouTube 知识类博主",
        "LinkedIn 行业专家",
        "Twitter 影响者",
      ],
      marketPosition: determineMarketPosition(avgLikes),
    },
    marketPosition: {
      currentPosition: determineMarketPosition(avgLikes),
      targetPosition: "行业专家",
      positioningStrategy: "专业化差异化",
    },
    differentiators: {
      contentDiff: ["深度拆解", "案例分析", "行业趋势"],
      styleDiff: ["数据驱动", "互动增强", "图文结合"],
      valueDiff: ["可落地性", "实操方法", "长期陪伴式成长"],
    },
    benchmarkGap: {
      contentGap:
        avgLikes < 3000 ? "需要增强专业深度 & 结合行业热点" : "内容质量稳定",
      engagementGap:
        avgLikes < 5000
          ? "互动率有提升空间（评论、私信、社群运营）"
          : "互动表现良好",
      influenceGap:
        avgLikes < 10000
          ? "影响力需要扩展（跨平台运营 & 合作）"
          : "具备较强影响力",
    },
  };
}

// 8. 核心赛道分析
function analyzeCoreTrack(data) {
  return {
    industryPosition: {
      currentTrack: "职场成长 & 自媒体赛道",
      marketSize: "千亿级市场",
      growthRate: "年增长35%",
      competitionLevel: "中高",
    },
    marketTrends: {
      currentTrends: [
        "在线教育",
        "职业培训",
        "个人成长",
        "自媒体变现",
        "知识付费",
      ],
      futureTrends: [
        "AI 赋能内容创作",
        "短视频+长内容结合",
        "KOL 社群经济",
        "平台跨界合作",
      ],
      opportunities: [
        "垂直深耕（职场、自媒体运营）",
        "品牌建设（个人IP + 机构化运营）",
        "多元变现（付费社群、课程、广告）",
      ],
    },
    competitiveAdvantages: {
      coreAdvantages: ["专业背景", "实战经验", "方法论体系", "小红书流量优势"],
      sustainableAdvantages: [
        "持续学习",
        "内容创新",
        "精准用户画像",
        "社群运营能力",
      ],
      potentialAdvantages: [
        "产品矩阵（课程、工具、插件）",
        "品牌影响力",
        "商业模式多样化",
        "AI+数据驱动增长",
      ],
    },
    growthStrategy: {
      shortTerm: [
        "优化内容结构，提高互动率",
        "增加视频内容，提高用户停留时长",
        "提高账号数据分析能力，找出爆款规律",
      ],
      midTerm: [
        "搭建完整的课程 & 知识产品体系",
        "引入 AI 进行内容生产优化",
        "打造私域流量池，提升粉丝忠诚度",
      ],
      longTerm: [
        "建立行业 IP，成为头部影响者",
        "探索 AI 内容创作工具商业化",
        "构建完整的生态系统（自媒体+教育+社群+产品）",
      ],
    },
  };
}

// 辅助函数：根据平均点赞确定市场定位
function determineMarketPosition(avgLikes) {
  if (avgLikes >= 10000) return "行业领先";
  if (avgLikes >= 5000) return "快速成长";
  if (avgLikes >= 1000) return "稳步发展";
  return "初创期";
}
