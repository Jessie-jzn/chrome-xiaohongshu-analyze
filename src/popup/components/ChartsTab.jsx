import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export const ChartsTab = ({ data }) => {
  const likesChartRef = useRef(null);
  const typeChartRef = useRef(null);

  useEffect(() => {
    // 点赞分布图
    const likesCtx = likesChartRef.current?.getContext("2d");
    if (likesCtx) {
      new Chart(likesCtx, {
        type: "bar",
        data: {
          labels: ["0-100", "100-500", "500-1k", "1k-5k", "5k+"],
          datasets: [
            {
              label: "点赞分布",
              data: calculateLikesDistribution(data.stats),
              backgroundColor: "rgba(255, 99, 132, 0.5)",
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: "点赞数分布",
            },
          },
        },
      });
    }

    // 内容类型占比图
    const typeCtx = typeChartRef.current?.getContext("2d");
    if (typeCtx) {
      new Chart(typeCtx, {
        type: "doughnut",
        data: {
          labels: ["视频", "图文"],
          datasets: [
            {
              data: [data.stats.videoCount, data.stats.imageCount],
              backgroundColor: [
                "rgba(54, 162, 235, 0.5)",
                "rgba(255, 206, 86, 0.5)",
              ],
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: "内容类型占比",
            },
          },
        },
      });
    }
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-4">
        <canvas ref={likesChartRef} />
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <canvas ref={typeChartRef} />
      </div>
    </div>
  );
};

function calculateLikesDistribution(stats) {
  // 这里需要根据实际数据计算分布
  return [30, 25, 20, 15, 10]; // 示例数据
}
