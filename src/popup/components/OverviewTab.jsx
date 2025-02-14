import React from "react";
import { AnalysisCard } from "./AnalysisCard";
import { StatsCard } from "./StatsCard";
import { KeywordCloud } from "./KeywordCloud";

export const OverviewTab = ({ data }) => {
  const { stats, titleAnalysis, keywordAnalysis, influencerAnalysis } = data;

  return (
    <div>
      <StatsCard
        totalNotes={stats.totalNotes}
        avgLikes={stats.avgLikes}
        videoCount={stats.videoCount}
        imageCount={stats.imageCount}
      />

      <AnalysisCard
        title="🔍 标题分析"
        data={{
          avgLength: titleAnalysis.avgLength,
          hasNumber: titleAnalysis.patterns.hasNumber,
          hasEmoji: titleAnalysis.patterns.hasEmoji,
        }}
        type="titleAnalysis"
      />

      <KeywordCloud keywords={keywordAnalysis.keywords} />

      {influencerAnalysis && (
        <div className="mt-4">
          <h4 className="text-lg font-bold mb-2">🎯 博主定位分析</h4>
          <AnalysisCard
            title="内容输出"
            data={influencerAnalysis.contentOutput}
            type="contentOutput"
          />
          <AnalysisCard
            title="变现路径"
            data={influencerAnalysis.monetization}
            type="monetization"
          />
        </div>
      )}
    </div>
  );
};
