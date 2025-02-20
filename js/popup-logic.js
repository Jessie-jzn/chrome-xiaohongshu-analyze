// 先导入依赖模块
import { addTabs, displayResults } from "./ui.js";
import { analyzeData } from "./analyzer.js";
import { exportToExcel } from "./exporter.js";
import { saveAnalysisResult } from "./storage.js";

// 配置对象
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
    AUTHOR_LINK: ".author",
    AUTHOR_AVATAR: ".author-avatar",
    NOTE_FOOTER: ".footer",
  },
};

// 错误处理显示函数
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

// 进度显示函数
function updateProgress(progress, progressBar, progressText) {
  progressBar.style.width = `${progress}%`;
  progressText.textContent = `进度：${progress}%`;
  const hue = progress * 1.2;
  progressBar.style.backgroundColor = `hsl(${hue}, 70%, 50%)`;
}

// 将主要逻辑移到这里
export async function initializeUI() {
  addTabs();
  setupExportButton();
  setupAnalyzeButton();
}

export async function loadInitialData() {
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

export async function handleAnalyzeClick() {
  const noteCount = parseInt(document.getElementById("noteCount").value);
  const resultDiv = document.getElementById("result");
  const progressContainer = document.getElementById("progressContainer");
  const progressBar = document.getElementById("progressBar");
  const contentContainer = document.getElementById("contentContainer");

  if (noteCount <= 0 || isNaN(noteCount)) {
    showError("请输入有效的笔记数量", resultDiv);
    return;
  }

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
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab.url.includes("xiaohongshu.com")) {
      throw new Error("请在小红书网页中使用此功能");
    }

    // 注入并执行内容脚本
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async function (targetCount, config) {
        return new Promise(async (resolve, reject) => {
          try {
            // 等待页面加载完成
            const elements = await new Promise(
              (resolveElements, rejectElements) => {
                const startTime = Date.now();
                const checkElements = () => {
                  const elements = document.querySelectorAll(
                    config.SELECTORS.NOTE_ITEM
                  );
                  if (elements.length > 0) {
                    resolveElements(elements);
                  } else if (Date.now() - startTime > config.LOAD_TIMEOUT) {
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
            let scrollAttempts = 0;

            // 发送进度更新
            const sendProgress = (progress) => {
              chrome.runtime.sendMessage({
                type: "UPDATE_PROGRESS",
                progress: progress,
              });
            };

            while (
              notes.size < targetCount &&
              scrollAttempts < config.MAX_SCROLL_ATTEMPTS
            ) {
              try {
                const noteElements = document.querySelectorAll(
                  config.SELECTORS.NOTE_ITEM
                );

                noteElements.forEach((element) => {
                  if (!element.dataset.processed) {
                    try {
                      const selectors = config.SELECTORS;
                      const noteData = {
                        title:
                          element
                            .querySelector(selectors.TITLE)
                            ?.textContent?.trim() || "",
                        author:
                          element
                            .querySelector(selectors.AUTHOR)
                            ?.textContent?.trim() || "",
                        likes:
                          element
                            .querySelector(selectors.LIKES)
                            ?.textContent?.trim() || "0",
                        isVideo:
                          element.querySelector(selectors.VIDEO) !== null,
                        timestamp: new Date().toISOString(),
                        link:
                          element.querySelector(selectors.COVER_LINK)?.href ||
                          "",
                        cover:
                          element
                            .querySelector(selectors.COVER_IMAGE)
                            ?.getAttribute("src") || "",
                        // 添加新的数据字段
                        authorLink:
                          element.querySelector(selectors.AUTHOR_LINK)?.href ||
                          "",
                        authorAvatar:
                          element.querySelector(selectors.AUTHOR_AVATAR)?.src ||
                          "",
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

                await new Promise((resolve) =>
                  setTimeout(resolve, config.SCROLL_DELAY)
                );

                if (currentHeight === lastHeight) {
                  noChangeCount++;
                  if (noChangeCount >= config.MAX_NO_CHANGE_COUNT) {
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
                authorLink: note.authorLink,
                authorAvatar: note.authorAvatar,
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
      args: [noteCount, CONFIG],
    });

    // 监听来自内容脚本的消息
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === "UPDATE_PROGRESS") {
        const progress = message.progress;
        updateProgress(
          progress,
          progressBar,
          document.getElementById("progressText")
        );
      }
    });

    // 处理结果
    if (result && result[0]?.result) {
      const data = result[0].result;
      resultDiv.innerHTML = "";
      displayResults(data, true);
      await saveAnalysisResult(data);
    } else {
      throw new Error("未能获取数据");
    }
  } catch (error) {
    showError(error.message, resultDiv);
  } finally {
    progressContainer.style.display = "none";
  }
}

export async function handleExportClick() {
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

export function setupExportButton() {
  const exportButton = document.getElementById("exportButton");
  exportButton.addEventListener("mouseenter", () => {
    exportButton.style.backgroundColor = "#45a049";
  });
  exportButton.addEventListener("mouseleave", () => {
    exportButton.style.backgroundColor = "#4CAF50";
  });
}

export function setupAnalyzeButton() {
  const analyzeButton = document.getElementById("analyzeButton");
  analyzeButton.addEventListener("mouseenter", () => {
    analyzeButton.style.backgroundColor = "#ff8080";
  });
  analyzeButton.addEventListener("mouseleave", () => {
    analyzeButton.style.backgroundColor = "#ff9999";
  });
}
