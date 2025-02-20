import { generateCharts } from "./js/charts.js";
import { analyzeData } from "./js/analyzer.js";
import { exportToExcel } from "./js/exporter.js";
import { addTabs, displayResults } from "./js/ui.js";
import { saveAnalysisResult, loadHistory } from "./js/storage.js";
import { initializeUI, loadInitialData, handleAnalyzeClick, handleExportClick } from "./js/popup-logic.js";

// 改进配置对象
const CONFIG = {
  SCROLL_DELAY: 1500,
  MAX_SCROLL_ATTEMPTS: 50,
  MAX_NO_CHANGE_COUNT: 3,
  LOAD_TIMEOUT: 10000,
  SELECTORS: {
    NOTE_ITEM: "section.note-item",
    TITLE: "span[data-v-0cdd7be0]",
    AUTHOR: ".author .name",
    LIKES: ".like-wrapper .count",
    VIDEO: ".video-container",
    COVER_LINK: "a.cover",
    COVER_IMAGE: "img[data-xhs-img]",
  },
};

// 只在实际运行时执行这些代码
if (typeof window !== 'undefined') {
  // 主要事件监听和初始化
  document.addEventListener("DOMContentLoaded", async () => {
    initializeUI();
    await loadInitialData();
  });

  // 分析按钮点击事件
  document.getElementById("analyzeButton")?.addEventListener("click", async () => {
    await handleAnalyzeClick();
  });

  // 导出按钮点击事件
  document.getElementById("exportButton")?.addEventListener("click", handleExportClick);
}

// 改进错误处理的显示函数
function showError(message, container) {
  container.innerHTML = `
    <div class="error-message" style="color: red; padding: 20px; text-align: center;">
      <p>😕 ${message}</p>
      <p>如需帮助，请检查以下内容：</p>
      <ul style="text-align: left;">
        <li>确保在小红书页面使用此功能</li>
        <li>检查网络连接是否正常</li>
        <li>尝试刷新页面后重试</li>
      </ul>
    </div>
  `;
}

// 改进进度显示
function updateProgress(progress, progressBar, progressText) {
  progressBar.style.width = `${progress}%`;
  progressText.textContent = `进度：${progress}%`;

  // 添加进度条颜色渐变
  const hue = progress * 1.2; // 120是绿色的色相值
  progressBar.style.backgroundColor = `hsl(${hue}, 70%, 50%)`;
}

// 设置导出按钮
function setupExportButton() {
  const exportButton = document.getElementById("exportButton");
  exportButton.addEventListener("mouseenter", () => {
    exportButton.style.backgroundColor = "#45a049";
  });
  exportButton.addEventListener("mouseleave", () => {
    exportButton.style.backgroundColor = "#4CAF50";
  });
}

// 设置分析按钮
function setupAnalyzeButton() {
  const analyzeButton = document.getElementById("analyzeButton");
  analyzeButton.addEventListener("mouseenter", () => {
    analyzeButton.style.backgroundColor = "#ff8080";
  });
  analyzeButton.addEventListener("mouseleave", () => {
    analyzeButton.style.backgroundColor = "#ff9999";
  });
}

export { handleAnalyzeClick };
