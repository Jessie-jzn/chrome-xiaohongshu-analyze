// 导出相关功能
export function exportToExcel(data, analysis) {
  try {
    if (typeof XLSX === "undefined") {
      throw new Error("XLSX 库未加载");
    }

    const wb = createWorkbook(data, analysis);
    downloadWorkbook(wb);
  } catch (error) {
    console.error("导出错误:", error);
    alert("导出失败，请检查控制台获取详细错误信息");
  }
}

function createWorkbook(data, analysis) {
  const wb = XLSX.utils.book_new();

  // 添加各个工作表
  addNotesSheet(wb, data);
  addStatsSheet(wb, analysis);
  addDistributionSheet(wb, analysis);
  addKeywordsSheet(wb, analysis);

  return wb;
}

function addNotesSheet(wb, data) {
  // 准备笔记数据
  const notesData = data.map((note) => ({
    标题: note.title,
    作者: note.author,
    点赞数: note.likesNum,
    类型: note.isVideo ? "视频" : "图文",
    发布时间: new Date(note.timestamp).toLocaleString(),
    链接: note.link,
  }));

  const ws = XLSX.utils.json_to_sheet(notesData);
  XLSX.utils.book_append_sheet(wb, ws, "笔记列表");
}

function addStatsSheet(wb, analysis) {
  const { stats } = analysis;
  const statsData = [
    ["总笔记数", stats.totalNotes],
    ["总点赞数", stats.totalLikes],
    ["平均点赞", stats.avgLikes],
    ["最高点赞", stats.maxLikes],
    ["最低点赞", stats.minLikes],
    ["视频数量", stats.videoCount],
    ["图文数量", stats.imageCount],
  ];

  const ws = XLSX.utils.aoa_to_sheet(statsData);
  XLSX.utils.book_append_sheet(wb, ws, "统计数据");
}

function addDistributionSheet(wb, analysis) {
  const distributionData = Object.entries(analysis.likesDistribution).map(
    ([range, count]) => ({
      点赞范围: range,
      笔记数量: count,
    })
  );

  const ws = XLSX.utils.json_to_sheet(distributionData);
  XLSX.utils.book_append_sheet(wb, ws, "点赞分布");
}

function addKeywordsSheet(wb, analysis) {
  const keywordsData = analysis.topKeywords.map((item) => ({
    关键词: item.keyword,
    出现次数: item.count,
    平均点赞: item.avgLikes,
    总点赞: item.totalLikes,
  }));

  const ws = XLSX.utils.json_to_sheet(keywordsData);
  XLSX.utils.book_append_sheet(wb, ws, "关键词分析");
}

function downloadWorkbook(wb) {
  // 生成文件名
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `小红书笔记分析_${timestamp}.xlsx`;

  // 导出文件
  XLSX.writeFile(wb, fileName);
}
