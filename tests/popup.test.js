import { jest } from "@jest/globals";

// 先声明模拟模块
const mockDisplayResults = jest.fn();
const mockSaveAnalysisResult = jest.fn();
const mockAddTabs = jest.fn();
const mockAnalyzeData = jest.fn();
const mockExportToExcel = jest.fn();

// 模拟依赖模块
jest.unstable_mockModule("../js/storage.js", () => ({
  saveAnalysisResult: mockSaveAnalysisResult,
  loadHistory: jest.fn(),
}));

jest.unstable_mockModule("../js/ui.js", () => ({
  addTabs: mockAddTabs,
  displayResults: mockDisplayResults,
}));

jest.unstable_mockModule("../js/analyzer.js", () => ({
  analyzeData: mockAnalyzeData,
}));

jest.unstable_mockModule("../js/exporter.js", () => ({
  exportToExcel: mockExportToExcel,
}));

// 在模拟之后导入要测试的模块
const { handleAnalyzeClick } = await import("../js/popup-logic.js");

describe("Popup functionality", () => {
  beforeEach(() => {
    // 在每个测试前重置 DOM 和 mock
    document.body.innerHTML = `
      <input id="noteCount" value="" />
      <div id="result"></div>
      <div id="progressContainer">
        <div id="progressBar"></div>
      </div>
      <div id="contentContainer"></div>
      <button id="analyzeButton">分析</button>
      <button id="exportButton">导出</button>
    `;
    
    // 重置所有 mock
    jest.clearAllMocks();
  });

  test("handleAnalyzeClick validates input", async () => {
    document.getElementById("noteCount").value = "-1";
    await handleAnalyzeClick();
    expect(document.getElementById("result").innerHTML).toContain(
      "请输入有效的笔记数量"
    );
  });

  test("handleAnalyzeClick validates xiaohongshu URL", async () => {
    document.getElementById("noteCount").value = "10";
    chrome.tabs.query.mockResolvedValueOnce([
      { url: "https://www.google.com" }
    ]);

    await handleAnalyzeClick();
    expect(document.getElementById("result").innerHTML).toContain(
      "请在小红书网页中使用此功能"
    );
  });

  test("handleAnalyzeClick processes valid input", async () => {
    // 准备测试数据
    const testData = [{ title: "测试笔记", author: "测试作者" }];
    
    // 设置模拟返回值
    document.getElementById("noteCount").value = "10";
    chrome.tabs.query.mockResolvedValueOnce([
      { url: "https://www.xiaohongshu.com/explore" }
    ]);
    chrome.scripting.executeScript.mockResolvedValueOnce([
      { result: testData }
    ]);
    mockSaveAnalysisResult.mockResolvedValueOnce();

    // 执行测试
    await handleAnalyzeClick();

    // 验证调用
    expect(chrome.scripting.executeScript).toHaveBeenCalled();
    expect(mockDisplayResults).toHaveBeenCalledWith(testData, true);
    expect(mockSaveAnalysisResult).toHaveBeenCalledWith(testData);
  });

  test("handleAnalyzeClick handles errors", async () => {
    document.getElementById("noteCount").value = "10";
    chrome.tabs.query.mockRejectedValueOnce(new Error("测试错误"));

    await handleAnalyzeClick();
    expect(document.getElementById("result").innerHTML).toContain("测试错误");
  });
});
