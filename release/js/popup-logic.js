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

// 添加反爬虫配置
const ANTI_CRAWLER_CONFIG = {
  // 滚动延迟范围（毫秒）
  SCROLL_DELAY: {
    MIN: 1000,
    MAX: 3000,
  },
  // 处理笔记间隔范围（毫秒）
  NOTE_PROCESS_DELAY: {
    MIN: 100,
    MAX: 300,
  },
  // 模拟人类滚动行为
  SCROLL_BEHAVIOR: {
    // 每次滚动的距离范围（像素）
    STEP_RANGE: {
      MIN: 100,
      MAX: 300,
    },
    // 滚动步骤间隔（毫秒）
    STEP_DELAY: {
      MIN: 50,
      MAX: 150,
    },
  },
  // 批次处理配置
  BATCH: {
    SIZE: 5, // 每批处理的笔记数
    DELAY: {
      MIN: 2000,
      MAX: 5000,
    },
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
  console.log("progress", progress);
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

  // 修改消息监听器设置
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("收到消息:", message);
    if (message.type === "UPDATE_PROGRESS") {
      const progress = message.progress;
      updateProgress(
        progress,
        progressBar,
        document.getElementById("progressText")
      );
    }
  });

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
      func: async function (targetCount, config, antiCrawlerConfig) {
        return new Promise(async (resolve, reject) => {
          try {
            // 工具函数
            function getRandomDelay(min, max) {
              return Math.floor(Math.random() * (max - min + 1)) + min;
            }

            function easeInOutQuad(t) {
              return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            }

            async function smoothScroll(targetPosition, duration = 1000) {
              const startPosition = window.pageYOffset;
              const distance = targetPosition - startPosition;
              const steps = Math.max(Math.floor(duration / 16), 1);

              for (let i = 1; i <= steps; i++) {
                const progress = i / steps;
                const currentPosition =
                  startPosition + distance * easeInOutQuad(progress);
                window.scrollTo(0, currentPosition);
                await new Promise((resolve) => setTimeout(resolve, 16));
              }
            }

            // 修改进度更新函数
            function sendProgressUpdate(progress) {
              try {
                // 使用 chrome.runtime.sendMessage 发送消息
                chrome.runtime.sendMessage({
                  type: "UPDATE_PROGRESS",
                  progress: progress,
                });
                console.log("发送进度更新:", progress);
              } catch (error) {
                console.error("发送进度更新失败:", error);
              }
            }

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
            let lastProcessTime = Date.now();

            while (
              notes.size < targetCount &&
              scrollAttempts < config.MAX_SCROLL_ATTEMPTS
            ) {
              try {
                const noteElements = document.querySelectorAll(
                  config.SELECTORS.NOTE_ITEM
                );

                // 批量处理笔记
                for (let i = 0; i < noteElements.length; i++) {
                  const element = noteElements[i];
                  if (!element.dataset.processed) {
                    // 检查处理间隔
                    const now = Date.now();
                    const timeSinceLastProcess = now - lastProcessTime;
                    if (
                      timeSinceLastProcess <
                      antiCrawlerConfig.NOTE_PROCESS_DELAY.MIN
                    ) {
                      await new Promise((resolve) =>
                        setTimeout(
                          resolve,
                          getRandomDelay(
                            antiCrawlerConfig.NOTE_PROCESS_DELAY.MIN -
                              timeSinceLastProcess,
                            antiCrawlerConfig.NOTE_PROCESS_DELAY.MAX
                          )
                        )
                      );
                    }

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
                        // 每处理一个笔记就更新进度
                        const progress = Math.min(
                          Math.round((notes.size / targetCount) * 100),
                          100
                        );
                        sendProgressUpdate(progress);
                        console.log(
                          "当前进度:",
                          progress,
                          "%",
                          "笔记数:",
                          notes.size
                        );
                      }
                    } catch (error) {
                      console.error("提取笔记数据失败:", error);
                    }

                    element.dataset.processed = "true";
                    lastProcessTime = Date.now();

                    // 每处理一批次后暂停
                    if (i % antiCrawlerConfig.BATCH.SIZE === 0) {
                      await new Promise((resolve) =>
                        setTimeout(
                          resolve,
                          getRandomDelay(
                            antiCrawlerConfig.BATCH.DELAY.MIN,
                            antiCrawlerConfig.BATCH.DELAY.MAX
                          )
                        )
                      );
                    }
                  }
                }

                if (notes.size >= targetCount) {
                  break;
                }

                // 模拟人类滚动行为
                const currentHeight = document.documentElement.scrollHeight;
                const viewportHeight = window.innerHeight;
                const currentScroll = window.pageYOffset;
                const targetScroll = Math.min(
                  currentScroll +
                    getRandomDelay(
                      antiCrawlerConfig.SCROLL_BEHAVIOR.STEP_RANGE.MIN,
                      antiCrawlerConfig.SCROLL_BEHAVIOR.STEP_RANGE.MAX
                    ),
                  currentHeight - viewportHeight
                );

                await smoothScroll(targetScroll);
                await new Promise((resolve) =>
                  setTimeout(
                    resolve,
                    getRandomDelay(
                      antiCrawlerConfig.SCROLL_DELAY.MIN,
                      antiCrawlerConfig.SCROLL_DELAY.MAX
                    )
                  )
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
                await new Promise((resolve) => setTimeout(resolve, 3000));
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
      args: [noteCount, CONFIG, ANTI_CRAWLER_CONFIG],
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

// 当文档加载完成时初始化
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await initializeUI();
    await loadInitialData();

    // 添加按钮事件监听器
    document
      .getElementById("analyzeButton")
      .addEventListener("click", handleAnalyzeClick);
    document
      .getElementById("exportButton")
      .addEventListener("click", handleExportClick);
  } catch (error) {
    console.error("初始化失败:", error);
  }
});
