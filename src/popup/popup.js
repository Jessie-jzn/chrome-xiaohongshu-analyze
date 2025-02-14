import { generateCharts } from "./js/charts.js";
import { analyzeData } from "./js/analyzer.js";
import { exportToExcel } from "./js/exporter.js";
import { addTabs, displayResults } from "./js/ui.js";
import { saveAnalysisResult, loadHistory } from "./js/storage.js";
import { fetchWithRetry } from "./js/utils.js";

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
      displayResults(result.lastAnalysis.data, true);
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
  const progressContainer = document.getElementById("progressContainer");
  const progressBar = document.getElementById("progressBar");
  const contentContainer = document.getElementById("contentContainer");

  // 清空之前的内容
  contentContainer.innerHTML = "";

  // 显示加载提示和进度条
  resultDiv.innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <p>正在加载数据，请稍候...</p>
      <p>需要分析 ${noteCount} 篇笔记，可能需要一些时间</p>
      <p id="progressText">进度：0%</p>
    </div>
  `;
  progressContainer.style.display = "block";
  progressBar.style.width = "0%";

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
                  // 更新选择器以匹配小红书的实际结构
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

            // 修改发送进度更新的方法
            const sendProgress = (progress) => {
              // 使用 chrome.runtime.sendMessage 替代 postMessage
              chrome.runtime.sendMessage({
                type: "UPDATE_PROGRESS",
                progress: progress,
              });
            };

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
                            .querySelector("span[data-v-0cdd7be0]")
                            ?.textContent?.trim() || "",
                        author:
                          element
                            .querySelector(".author .name")
                            ?.textContent?.trim() || "",
                        authorLink:
                          element.querySelector(".author")?.href || "",
                        likes:
                          element
                            .querySelector(".like-wrapper .count")
                            ?.textContent?.trim() || "0",
                        isVideo: element.querySelector(".play-icon") !== null,
                        timestamp: new Date().toISOString(),
                        link: element.querySelector("a.cover")?.href || "",
                        cover:
                          element
                            .querySelector("img[data-xhs-img]")
                            ?.getAttribute("src") || "",
                      };

                      if (noteData.title && noteData.author) {
                        notes.add(JSON.stringify(noteData));
                        console.log("找到笔记:", noteData);
                      }
                    } catch (error) {
                      console.error("提取笔记数据失败:", error);
                    }
                    element.dataset.processed = "true";
                  }
                });

                // 更新进度
                const progress = Math.min(
                  Math.round((notes.size / targetCount) * 100),
                  100
                );
                sendProgress(progress);
                console.log("当前进度:", progress, "%");

                if (notes.size >= targetCount) {
                  break;
                }

                const currentHeight = document.documentElement.scrollHeight;
                window.scrollTo({
                  top: currentHeight,
                  behavior: "smooth",
                });

                console.log("滚动到:", currentHeight);

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
                cover: note.cover,
              }))
              .sort((a, b) => b.likesNum - a.likesNum);

            console.log("处理完成，共找到笔记:", processedNotes.length);
            resolve(processedNotes);
          } catch (error) {
            console.error("分析失败:", error);
            reject(error);
          }
        });
      },
      args: [noteCount],
    });

    // 监听来自内容脚本的消息
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === "UPDATE_PROGRESS") {
        const progress = message.progress;
        progressBar.style.width = `${progress}%`;
        document.getElementById(
          "progressText"
        ).textContent = `进度：${progress}%`;
      }
    });

    // 处理结果
    if (result && result[0]?.result) {
      const data = result[0].result;
      // 清空加载提示
      resultDiv.innerHTML = "";
      // 显示分析结果，传入 true 以显示标签页
      displayResults(data, true);
      await saveAnalysisResult(data);
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
  } finally {
    // 隐藏进度条
    progressContainer.style.display = "none";
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
