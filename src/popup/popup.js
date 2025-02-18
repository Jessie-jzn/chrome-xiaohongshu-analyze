import { generateCharts } from "../services/analyzer/charts";
import { analyzeData } from "../services/analyzer";
import { exportToExcel } from "../utils/export";
import { addTabs, displayResults } from "../components/ui";
import { saveAnalysisResult, loadHistory } from "../services/storage";
import { fetchWithRetry } from "../utils/retry";

// 主要事件监听和初始化
document.addEventListener("DOMContentLoaded", async () => {
  initializeUI();
  await loadInitialData();
});

// 分析按钮点击事件
document.getElementById("analyzeButton").addEventListener("click", async () => {
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "分析中...";

  try {
    // 获取当前标签页
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    // 执行内容脚本
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: extractPageData,
    });

    // 处理数据
    const data = result[0].result;
    if (data && data.length > 0) {
      // 保存数据
      await chrome.storage.local.set({ lastAnalysis: data });

      // 显示结果
      resultDiv.innerHTML = `
        <h3>分析结果：</h3>
        <p>共发现 ${data.length} 篇笔记</p>
        <p>平均点赞：${Math.round(data.reduce((sum, item) => sum + item.likes, 0) / data.length)}</p>
        <p>视频占比：${Math.round((data.filter((item) => item.isVideo).length / data.length) * 100)}%</p>
      `;
    } else {
      resultDiv.innerHTML = "未找到数据，请确保在小红书页面使用";
    }
  } catch (error) {
    resultDiv.innerHTML = `分析失败：${error.message}`;
  }
});

// 导出按钮点击事件
document
  .getElementById("exportButton")
  .addEventListener("click", handleExportClick);

// 初始化UI
async function initializeUI() {
  addTabs();
  setupExportButton();
  setupAnalyzeButton();
}

// 加载初始数据
async function loadInitialData() {
  try {
    const result = await chrome.storage.local.get("lastAnalysis");
    if (result.lastAnalysis) {
      displayResults(result.lastAnalysis.data, true);
    } else {
      document.getElementById("contentContainer").innerHTML =
        "<p>暂无分析数据，请先进行分析。</p>";
    }
  } catch (error) {
    console.error("加载初始数据失败:", error);
  }
}

// 数据提取函数
function extractPageData() {
  const notes = Array.from(document.querySelectorAll("section.note-item")).map(
    (note) => ({
      title: note.querySelector(".title span")?.textContent?.trim() || "",
      likes: parseInt(
        note
          .querySelector(".like-wrapper .count")
          ?.textContent?.replace(/[^\d]/g, "") || "0"
      ),
      isVideo: note.querySelector(".video-container") !== null,
      author: note.querySelector(".author .name")?.textContent?.trim() || "",
      link: note.querySelector("a.cover")?.href || "",
    })
  );

  return notes;
}

// 处理导出按钮点击
async function handleExportClick() {
  try {
    const { lastAnalysis } = await chrome.storage.local.get("lastAnalysis");
    if (!lastAnalysis) {
      alert("没有可导出的数据，请先进行分析");
      return;
    }

    // 创建CSV内容
    const csvContent = [
      ["标题", "点赞数", "类型", "作者", "链接"],
      ...lastAnalysis.map((item) => [
        item.title,
        item.likes,
        item.isVideo ? "视频" : "图文",
        item.author,
        item.link,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    // 下载文件
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `小红书数据_${new Date().toLocaleDateString()}.csv`;
    link.click();
  } catch (error) {
    alert("导出失败：" + error.message);
  }
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

async function fetchAuthorNotes(userId, cursor = "", notes = []) {
  try {
    const data = await fetchWithRetry(
      `https://edith.xiaohongshu.com/api/sns/web/v1/user_posted?num=30&cursor=${cursor}&user_id=${userId}`,
      {
        credentials: "include",
      }
    );

    if (data.success && data.data) {
      const newNotes = [...notes, ...data.data.notes];

      // 如果还有更多数据并且数量未达到目标，继续获取
      if (data.data.has_more && newNotes.length < 100) {
        // 添加随机延迟后再请求下一页
        await new Promise((resolve) => setTimeout(resolve, getRandomDelay()));
        return fetchAuthorNotes(userId, data.data.cursor, newNotes);
      }

      return newNotes;
    }
    throw new Error("获取数据失败");
  } catch (error) {
    console.error("API请求失败:", error);
    throw error;
  }
}

// 处理API数据
function processApiNotes(notes) {
  return notes.map((note) => ({
    title: note.display_title,
    author: note.user.nickname,
    authorId: note.user.user_id,
    authorAvatar: note.user.avatar,
    likesNum: parseInt(note.interact_info.liked_count),
    isVideo: note.type === "video",
    timestamp: new Date().toISOString(), // API中可能需要另外获取时间
    link: `https://www.xiaohongshu.com/explore/${note.note_id}`,
    cover: note.cover.url_default,
    noteId: note.note_id,
  }));
}
