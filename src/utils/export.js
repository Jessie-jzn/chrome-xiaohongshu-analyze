import * as XLSX from "xlsx";

export const exportToExcel = (data) => {
  // 创建CSV内容
  const csvContent = [
    ["标题", "点赞数", "类型", "作者", "链接"],
    ...data.map((item) => [
      item.title,
      item.likes,
      item.isVideo ? "视频" : "图文",
      item.author,
      item.link,
    ]),
  ]
    .map((row) => row.join(","))
    .join("\n");

  // 创建Blob对象
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  // 创建下载链接
  const link = document.createElement("a");
  link.href = url;
  link.download = `小红书数据_${new Date().toLocaleDateString()}.csv`;
  link.click();
};
