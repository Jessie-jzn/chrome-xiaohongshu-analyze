import { generateCharts } from "./js/charts.js";
import { analyzeData } from "./js/analyzer.js";
import { exportToExcel } from "./js/exporter.js";
import { addTabs, displayResults } from "./js/ui.js";
import { saveAnalysisResult, loadHistory } from "./js/storage.js";

// 主要事件监听和初始化
document.addEventListener("DOMContentLoaded", async () => {
  initializeUI();
  await loadInitialData();
});

// 分析按钮点击事件
document.getElementById("analyzeButton").addEventListener("click", async () => {
  await handleAnalyzeClick();
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
      displayResults(result.lastAnalysis.data, false);
    } else {
      document.getElementById("contentContainer").innerHTML =
        "<p>暂无分析数据，请先进行分析。</p>";
    }
  } catch (error) {
    console.error("加载初始数据失败:", error);
  }
}

// 处理分析按钮点击
async function handleAnalyzeClick() {
  const noteCount = parseInt(document.getElementById("noteCount").value);
  const resultDiv = document.getElementById("result");

  // 显示加载提示
  resultDiv.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <p>正在加载数据，请稍候...</p>
        <p>需要分析 ${noteCount} 篇笔记，可能需要一些时间</p>
      </div>
    `;

  try {
    // 获取当前标签页
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    // 注入并执行内容脚本
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async function (targetCount) {
        return new Promise(async (resolve, reject) => {
          try {
            // 等待页面加载完成
            const elements = await new Promise(
              (resolveElements, rejectElements) => {
                const startTime = Date.now();
                const checkElements = () => {
                  const elements =
                    document.querySelectorAll("section.note-item");
                  if (elements.length > 0) {
                    resolveElements(elements);
                  } else if (Date.now() - startTime > 10000) {
                    rejectElements(new Error("等待元素超时"));
                  } else {
                    setTimeout(checkElements, 100);
                  }
                };
                checkElements();
              }
            );

            const notes = new Set();
            let lastHeight = 0;
            let noChangeCount = 0;
            const maxScrollAttempts = 50;
            let scrollAttempts = 0;

            while (
              notes.size < targetCount &&
              scrollAttempts < maxScrollAttempts
            ) {
              try {
                const noteElements =
                  document.querySelectorAll("section.note-item");

                noteElements.forEach((element) => {
                  if (!element.dataset.processed) {
                    try {
                      const noteData = {
                        title:
                          element
                            .querySelector("a.title")
                            ?.textContent?.trim() || "",
                        author:
                          element
                            .querySelector("a.author")
                            ?.textContent?.trim() || "",
                        likes:
                          element
                            .querySelector(".like-wrapper .count")
                            ?.textContent?.trim() || "0",
                        isVideo:
                          element.querySelector(".video-container") !== null,
                        timestamp:
                          element.querySelector("time")?.dateTime ||
                          new Date().toISOString(),
                        link: element.querySelector("a.title")?.href || "",
                      };

                      if (noteData.title && noteData.author) {
                        notes.add(JSON.stringify(noteData));
                      }
                    } catch (error) {
                      console.error("提取笔记数据失败:", error);
                    }
                    element.dataset.processed = "true";
                  }
                });

                if (notes.size >= targetCount) {
                  break;
                }

                const currentHeight = document.documentElement.scrollHeight;
                window.scrollTo({
                  top: currentHeight,
                  behavior: "smooth",
                });

                await new Promise((resolve) => setTimeout(resolve, 1500));

                if (currentHeight === lastHeight) {
                  noChangeCount++;
                  if (noChangeCount >= 3) {
                    console.log("已到达页面底部");
                    break;
                  }
                } else {
                  noChangeCount = 0;
                  lastHeight = currentHeight;
                }

                scrollAttempts++;
              } catch (error) {
                console.error("滚动过程出错:", error);
                await new Promise((resolve) => setTimeout(resolve, 2000));
              }
            }

            const processedNotes = Array.from(notes)
              .slice(0, targetCount)
              .map(JSON.parse)
              .map((note) => ({
                title: note.title,
                author: note.author,
                likesNum: parseInt(note.likes.replace(/[^\d]/g, "")) || 0,
                isVideo: note.isVideo,
                timestamp: note.timestamp,
                link: note.link,
              }))
              .sort((a, b) => b.likesNum - a.likesNum);

            // 调试输出
            console.log("处理后的数据:", processedNotes);

            resolve(processedNotes);
          } catch (error) {
            console.error("分析失败:", error);
            reject(error);
          }
        });
      },
      args: [noteCount],
    });

    // 处理结果
    if (result && result[0]?.result) {
      const data = result[0].result;
      displayResults(data);
      await saveAnalysisResult(data);

      // 输出处理后的数据
      console.log("处理后的数据（按点赞排序）:", data);
    } else {
      throw new Error("未能获取数据");
    }
  } catch (error) {
    resultDiv.innerHTML = `
        <div style="color: red; padding: 20px;">
          <p>数据加载失败：${error.message}</p>
          <p>请确保在小红书页面使用此功能</p>
        </div>
      `;
  }
}

// 处理导出按钮点击
async function handleExportClick() {
  try {
    const result = await chrome.storage.local.get("lastAnalysis");
    if (result.lastAnalysis) {
      const { data } = result.lastAnalysis;
      const analysis = analyzeData(data);
      exportToExcel(data, analysis);
    } else {
      alert("暂无数据可导出，请先进行分析");
    }
  } catch (error) {
    console.error("导出失败:", error);
    alert("导出失败，请检查控制台获取详细错误信息");
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
