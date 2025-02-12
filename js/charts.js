// 图表相关功能
export function generateCharts(data, analysis) {
  if (typeof Chart === "undefined") {
    console.error("Chart.js 未加载，跳过图表生成");
    return;
  }

  try {
    // 清除旧图表
    const charts = Chart.getChart("likesChart");
    if (charts) charts.destroy();
    const chartType = Chart.getChart("contentTypeChart");
    if (chartType) chartType.destroy();
    const chartTrends = Chart.getChart("trendsChart");
    if (chartTrends) chartTrends.destroy();

    createLikesChart(analysis);
    createTypeChart(analysis);
    createTrendsChart(data);
  } catch (error) {
    console.error("生成图表时出错:", error);
  }
}

function createLikesChart(analysis) {
  new Chart(document.getElementById("likesChart"), {
    type: "bar",
    data: {
      labels: Object.keys(analysis.likesDistribution),
      datasets: [
        {
          label: "笔记数量",
          data: Object.values(analysis.likesDistribution),
          backgroundColor: "rgba(255, 99, 132, 0.5)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "点赞数量分布",
        },
        legend: {
          display: false,
        },
      },
    },
  });
}

function createTypeChart(analysis) {
  new Chart(document.getElementById("contentTypeChart"), {
    type: "doughnut",
    data: {
      labels: ["图文", "视频"],
      datasets: [
        {
          data: [analysis.stats.imageCount, analysis.stats.videoCount],
          backgroundColor: [
            "rgba(54, 162, 235, 0.5)",
            "rgba(255, 206, 86, 0.5)",
          ],
          borderColor: ["rgba(54, 162, 235, 1)", "rgba(255, 206, 86, 1)"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "内容类型分布",
        },
      },
    },
  });
}

function createTrendsChart(data) {
  const trendsData = analyzeTrends(data);
  new Chart(document.getElementById("trendsChart"), {
    type: "line",
    data: {
      labels: trendsData.labels,
      datasets: [
        {
          label: "平均点赞",
          data: trendsData.avgLikes,
          borderColor: "rgba(75, 192, 192, 1)",
          tension: 0.1,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "点赞趋势分析",
        },
      },
    },
  });
}

function analyzeTrends(data) {
  // 按时间排序
  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a.timestamp);
    const dateB = new Date(b.timestamp);
    return dateA - dateB;
  });

  // 按周分组
  const weeklyData = {};
  sortedData.forEach((note) => {
    const date = new Date(note.timestamp);
    const weekKey = `${date.getFullYear()}-W${getWeekNumber(date)}`;
    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = {
        likes: [],
        total: 0,
      };
    }
    weeklyData[weekKey].likes.push(note.likesNum);
    weeklyData[weekKey].total++;
  });

  // 计算每周平均点赞
  const labels = [];
  const avgLikes = [];
  Object.entries(weeklyData).forEach(([week, data]) => {
    labels.push(week);
    avgLikes.push(
      Math.round(data.likes.reduce((a, b) => a + b, 0) / data.total)
    );
  });

  return { labels, avgLikes };
}

function getWeekNumber(date) {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}
