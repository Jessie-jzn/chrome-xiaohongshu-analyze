import React from "react";
import { StatsCard } from "./StatsCard";
import { KeywordCloud } from "./KeywordCloud";
import { AnalysisCard } from "./AnalysisCard";

export const OverviewTab = ({ data }) => {
  const { stats, keywordAnalysis, titleAnalysis } = data;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <StatsCard title="笔记总数" value={stats.totalNotes} icon="📝" />
        <StatsCard
          title="平均点赞"
          value={Math.round(stats.avgLikes)}
          icon="❤️"
        />
        <StatsCard
          title="视频占比"
          value={`${Math.round((stats.videoCount / stats.totalNotes) * 100)}%`}
          icon="🎥"
        />
        <StatsCard
          title="图文占比"
          value={`${Math.round((stats.imageCount / stats.totalNotes) * 100)}%`}
          icon="🖼️"
        />
      </div>

      <KeywordCloud keywords={keywordAnalysis.keywords} />

      <AnalysisCard
        title="标题分析"
        items={[
          {
            label: "平均长度",
            value: `${Math.round(titleAnalysis.avgLength)}字`,
          },
          {
            label: "数字使用率",
            value: `${Math.round(titleAnalysis.patterns.hasNumber)}%`,
          },
          {
            label: "表情使用率",
            value: `${Math.round(titleAnalysis.patterns.hasEmoji)}%`,
          },
        ]}
      />
    </div>
  );
};
