import * as XLSX from "xlsx";

export const exportToExcel = (data) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "分析数据");

  // 生成文件名
  const fileName = `小红书分析_${new Date().toLocaleDateString()}.xlsx`;

  // 导出文件
  XLSX.writeFile(workbook, fileName);
};
