import React, { memo } from "react";
import { motion } from "framer-motion";

export const AnalysisCard = memo(({ title, data, type }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="analysis-card"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <h3 className="card-title">{title}</h3>
      <div className="card-content">{renderContent(data, type)}</div>
    </motion.div>
  );
});

const renderContent = (data, type) => {
  const renderers = {
    stats: renderStats,
    chart: renderChart,
    list: renderList,
  };

  return renderers[type]?.(data) || null;
};
