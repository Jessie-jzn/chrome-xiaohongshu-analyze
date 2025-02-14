import React from "react";

export const StatsCard = ({ totalNotes, avgLikes, videoCount, imageCount }) => (
  <div className="bg-white rounded-lg shadow p-4 mb-4">
    <div className="grid grid-cols-2 gap-4">
      <StatItem label="笔记总数" value={totalNotes} />
      <StatItem label="平均点赞" value={`${(avgLikes / 10000).toFixed(1)}万`} />
      <StatItem label="视频数量" value={videoCount} />
      <StatItem label="图文数量" value={imageCount} />
    </div>
  </div>
);

const StatItem = ({ label, value }) => (
  <div className="text-center">
    <div className="text-2xl font-bold text-primary">{value}</div>
    <div className="text-sm text-gray-600">{label}</div>
  </div>
);
