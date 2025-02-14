import React from "react";

export const KeywordCloud = ({ keywords }) => (
  <div className="bg-white rounded-lg shadow p-4 mb-4">
    <h4 className="text-lg font-bold mb-2">🔤 热门关键词</h4>
    <div className="flex flex-wrap gap-2">
      {keywords.map((keyword, index) => (
        <span
          key={index}
          className="px-2 py-1 bg-primary-light text-primary rounded-full text-sm"
          style={{
            fontSize: `${12 + keyword.weight * 2}px`,
          }}
        >
          {keyword.text}
        </span>
      ))}
    </div>
  </div>
);
