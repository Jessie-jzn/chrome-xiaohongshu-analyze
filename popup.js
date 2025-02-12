document.getElementById("analyzeButton").addEventListener("click", async () => {
  // 获取当前标签页
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // 获取选择的笔记数量
  const noteCount = document.getElementById("noteCount").value;

  // 显示加载提示
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <p>正在加载数据，请稍候...</p>
      <p>需要分析 ${noteCount} 篇笔记，可能需要一些时间</p>
    </div>
  `;

  try {
    // 注入并执行内容脚本
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: analyzeNotes,
      args: [parseInt(noteCount)],
    });

    // 显示结果
    displayResults(result[0].result);
    // 保存分析结果
    saveAnalysisResult(result[0].result);
  } catch (error) {
    resultDiv.innerHTML = `
      <div style="color: red; padding: 20px;">
        <p>数据加载失败：${error.message}</p>
        <p>请确保在小红书页面使用此功能</p>
      </div>
    `;
  }
});

// 添加随机延迟函数
function randomDelay(min, max) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

// 添加更多的随机用户行为模拟函数
function addRandomBehaviors() {
  // 模拟鼠标悬停
  async function simulateHover(element) {
    if (!element) return;
    const mouseenterEvent = new MouseEvent("mouseenter", {
      bubbles: true,
      cancelable: true,
      view: window,
    });
    element.dispatchEvent(mouseenterEvent);
    await randomDelay(500, 2000);
    const mouseleaveEvent = new MouseEvent("mouseleave", {
      bubbles: true,
      cancelable: true,
      view: window,
    });
    element.dispatchEvent(mouseleaveEvent);
  }

  // 模拟点击图片
  async function simulateImageClick() {
    const images = document.querySelectorAll("img");
    if (images.length > 0) {
      const randomImage = images[Math.floor(Math.random() * images.length)];
      randomImage.click();
      await randomDelay(500, 1500);
    }
  }

  // 模拟文本选择
  async function simulateTextSelection() {
    const textElements = document.querySelectorAll("p, span, div");
    if (textElements.length > 0) {
      const randomElement =
        textElements[Math.floor(Math.random() * textElements.length)];
      const range = document.createRange();
      range.selectNodeContents(randomElement);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      await randomDelay(300, 1000);
      selection.removeAllRanges();
    }
  }

  // 模拟鼠标轨迹移动
  async function simulateMouseTrack() {
    const points = [];
    const numPoints = Math.floor(Math.random() * 5) + 3; // 3-7个点

    // 生成随机路径点
    for (let i = 0; i < numPoints; i++) {
      points.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
      });
    }

    // 在路径点之间平滑移动
    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i];
      const end = points[i + 1];
      const steps = 10;

      for (let j = 0; j <= steps; j++) {
        const progress = j / steps;
        const x = start.x + (end.x - start.x) * progress;
        const y = start.y + (end.y - start.y) * progress;

        const event = new MouseEvent("mousemove", {
          bubbles: true,
          cancelable: true,
          clientX: x,
          clientY: y,
        });
        document.dispatchEvent(event);
        await randomDelay(20, 50);
      }
    }
  }

  return {
    simulateHover,
    simulateImageClick,
    simulateTextSelection,
    simulateMouseTrack,
  };
}

// 修改滚动加载函数
async function scrollAndWait() {
  // 获取笔记元素
  function getNoteElements() {
    const selectors = [
      "section.note-item",
      'section[class*="note-item"]',
      "section[data-v-14f91c23]",
      '[class*="note-item"]',
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        console.log(`找到笔记元素，使用选择器: ${selector}`);
        return elements;
      }
    }
    return [];
  }

  // 添加加载策略函数
  const loadingStrategies = {
    // 策略1：快速上下滚动
    async quickScroll() {
      for (let i = 0; i < 3; i++) {
        window.scrollBy({
          top: -500,
          behavior: "smooth",
        });
        await randomDelay(300, 500);
        window.scrollBy({
          top: 500,
          behavior: "smooth",
        });
        await randomDelay(300, 500);
      }
    },

    // 策略2：滚动到底部并停留
    async scrollToBottom() {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
      await randomDelay(2000, 3000);
    },

    // 策略3：分段滚动
    async scrollInSteps() {
      const height = document.documentElement.scrollHeight;
      const steps = 4;
      for (let i = 1; i <= steps; i++) {
        window.scrollTo({
          top: (height * i) / steps,
          behavior: "smooth",
        });
        await randomDelay(800, 1200);
      }
    },

    // 策略4：回到顶部再滚动到底部
    async resetAndScroll() {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      await randomDelay(1000, 1500);
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
      await randomDelay(2000, 3000);
    },

    // 策略5：缓慢连续滚动
    async smoothContinuousScroll() {
      const viewportHeight = window.innerHeight;
      const steps = 10;
      for (let i = 0; i < steps; i++) {
        window.scrollBy({
          top: viewportHeight * 0.3,
          behavior: "smooth",
        });
        await randomDelay(500, 800);
      }
    },
  };

  let lastCount = getNoteElements().length;
  console.log(`初始笔记数量: ${lastCount}`);
  let noChangeCount = 0;
  let totalScrolls = 0;
  let strategyIndex = 0;
  let retryCount = 0;

  while (lastCount < targetCount && totalScrolls < 100) {
    try {
      // 获取当前页面高度
      const currentHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;

      // 正常滚动
      window.scrollBy({
        top: viewportHeight * 0.8,
        behavior: "smooth",
      });
      await randomDelay(1000, 1500);

      // 检查是否到达底部
      if (window.scrollY + window.innerHeight >= currentHeight - 100) {
        const newElements = getNoteElements();
        const newCount = newElements.length;
        console.log(`滚动后笔记数量: ${newCount}`);

        if (newCount === lastCount) {
          noChangeCount++;
          if (noChangeCount >= 2) {
            // 尝试不同的加载策略
            const strategies = Object.values(loadingStrategies);
            console.log(`尝试加载策略 ${strategyIndex + 1}`);
            await strategies[strategyIndex]();

            // 检查策略是否有效
            const afterStrategyCount = getNoteElements().length;
            if (afterStrategyCount > newCount) {
              console.log(`策略 ${strategyIndex + 1} 成功加载新内容`);
              lastCount = afterStrategyCount;
              noChangeCount = 0;
              retryCount = 0;
            } else {
              // 切换到下一个策略
              strategyIndex = (strategyIndex + 1) % strategies.length;
              retryCount++;

              // 如果所有策略都试过了还是没有新内容
              if (retryCount >= strategies.length * 2) {
                console.log("所有策略都已尝试，暂停加载");
                await randomDelay(5000, 8000); // 长时间暂停
                retryCount = 0; // 重置重试计数
              }
            }
          }
        } else {
          lastCount = newCount;
          noChangeCount = 0;
          retryCount = 0;
          console.log("成功加载新内容");
          await randomDelay(1000, 2000);
        }
      }

      totalScrolls++;

      // 每10次滚动后暂停较长时间
      if (totalScrolls % 10 === 0) {
        console.log("暂停一下，避免触发反爬...");
        await randomDelay(3000, 5000);
      }
    } catch (error) {
      console.error("滚动加载出错:", error);
      await randomDelay(2000, 4000);
    }
  }

  // 缓慢滚动回顶部
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
  await randomDelay(1000, 2000);

  return getNoteElements();
}

// 修改在页面中执行的函数
async function analyzeNotes(targetCount) {
  // 添加延迟函数
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // 添加随机延迟函数
  const randomDelay = (min, max) => {
    const delayTime = Math.floor(Math.random() * (max - min + 1)) + min;
    return delay(delayTime);
  };

  // 修改滚动加载函数
  async function scrollAndWait() {
    // 获取笔记元素
    function getNoteElements() {
      const selectors = [
        "section.note-item",
        'section[class*="note-item"]',
        "section[data-v-14f91c23]",
        '[class*="note-item"]',
      ];

      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          console.log(`找到笔记元素，使用选择器: ${selector}`);
          return elements;
        }
      }
      return [];
    }

    let lastCount = getNoteElements().length;
    console.log(`初始笔记数量: ${lastCount}`);
    let noChangeCount = 0;
    let totalScrolls = 0;

    while (lastCount < targetCount && totalScrolls < 50) {
      try {
        // 随机滚动距离
        const scrollDistance = Math.floor(Math.random() * 500) + 500; // 500-1000px
        window.scrollBy({
          top: scrollDistance,
          behavior: "smooth",
        });

        // 随机等待时间
        await randomDelay(1500, 3000);

        // 偶尔上下抖动，模拟真实用户行为
        if (Math.random() > 0.7) {
          window.scrollBy({
            top: -100,
            behavior: "smooth",
          });
          await randomDelay(500, 1000);
          window.scrollBy({
            top: 100,
            behavior: "smooth",
          });
        }

        const newElements = getNoteElements();
        const newCount = newElements.length;
        console.log(`滚动后笔记数量: ${newCount}`);

        if (newCount === lastCount) {
          noChangeCount++;
          if (noChangeCount >= 3) {
            console.log("连续3次未加载到新内容，停止滚动");
            break;
          }
          // 尝试滚动到底部
          window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: "smooth",
          });
          await randomDelay(2000, 3000);
        } else {
          noChangeCount = 0;
          lastCount = newCount;
        }

        totalScrolls++;
        await randomDelay(800, 1500);
      } catch (error) {
        console.error("滚动加载出错:", error);
        await randomDelay(2000, 4000); // 出错后等待较长时间
      }
    }

    // 缓慢滚动回顶部
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    await delay(1000);

    return getNoteElements();
  }

  // 执行数据获取
  try {
    console.log(`准备获取 ${targetCount} 篇笔记的数据`);
    const noteElements = await scrollAndWait();
    console.log(`加载完成，共找到 ${noteElements.length} 篇笔记`);

    const noteData = [];
    const actualCount = Math.min(noteElements.length, targetCount);

    for (let i = 0; i < actualCount; i++) {
      try {
        const note = noteElements[i];
        console.log(`处理第 ${i + 1} 篇笔记`);

        // 随机延迟，避免过快处理
        await randomDelay(300, 800);

        // 模拟鼠标移动到元素上
        note.dispatchEvent(
          new MouseEvent("mouseover", {
            bubbles: true,
            cancelable: true,
            view: window,
          })
        );

        await randomDelay(100, 300);

        noteData.push({
          title:
            note.querySelector(".title span")?.textContent?.trim() || "无标题",
          author:
            note.querySelector(".author .name")?.textContent?.trim() ||
            "未知作者",
          likes:
            note.querySelector(".like-wrapper .count")?.textContent?.trim() ||
            "0",
          likesNum: parseLikes(
            note.querySelector(".like-wrapper .count")?.textContent?.trim() ||
              "0"
          ),
          coverImage: note.querySelector("img[data-xhs-img]")?.src || "",
          isVideo: !!note.querySelector(".play-icon"),
          link: note.querySelector('a[href*="/explore/"]')?.href || "",
          authorAvatar: note.querySelector("img.author-avatar")?.src || "",
        });

        // 移除鼠标
        note.dispatchEvent(
          new MouseEvent("mouseout", {
            bubbles: true,
            cancelable: true,
            view: window,
          })
        );
      } catch (error) {
        console.error(`处理第 ${i + 1} 篇笔记时出错:`, error);
        await randomDelay(1000, 2000); // 出错后等待较长时间
      }
    }

    // 解析点赞数的辅助函数
    function parseLikes(likesText) {
      if (!likesText) return 0;
      if (likesText.includes("万")) {
        return parseFloat(likesText.replace("万", "")) * 10000;
      } else if (likesText.includes("w")) {
        return parseFloat(likesText.replace("w", "")) * 10000;
      } else {
        return parseInt(likesText.replace(/[,，+]/g, "")) || 0;
      }
    }

    // 按点赞数排序
    noteData.sort((a, b) => b.likesNum - a.likesNum);
    console.log(`成功获取并排序 ${noteData.length} 篇笔记的数据`);

    return noteData;
  } catch (error) {
    console.error("获取数据失败:", error);
    return [];
  }
}

// 修改分析数据的函数
function analyzeData(data) {
  // 数据已经排序，直接使用
  const stats = {
    totalNotes: data.length,
    totalLikes: data.reduce((sum, note) => sum + note.likesNum, 0),
    avgLikes: Math.round(
      data.reduce((sum, note) => sum + note.likesNum, 0) / data.length
    ),
    videoCount: data.filter((note) => note.isVideo).length,
    imageCount: data.filter((note) => !note.isVideo).length,
    maxLikes: data[0]?.likesNum || 0, // 最高点赞数（已排序，第一个就是最高的）
    minLikes: data[data.length - 1]?.likesNum || 0, // 最低点赞数
  };

  // 作者分析
  const authorStats = data.reduce((acc, note) => {
    acc[note.author] = (acc[note.author] || 0) + 1;
    return acc;
  }, {});

  const topAuthors = Object.entries(authorStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  // 标题关键词分析
  const keywords = {};
  data.forEach((note) => {
    const words = note.title
      .replace(/[.,，。！？!?]/g, "")
      .split(/\s+/)
      .filter((word) => word.length >= 2);

    words.forEach((word) => {
      keywords[word] = (keywords[word] || 0) + 1;
    });
  });

  const topKeywords = Object.entries(keywords)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  // 点赞分布分析
  const likesDistribution = {
    "10万+": data.filter((n) => n.likesNum >= 100000).length,
    "5-10万": data.filter((n) => n.likesNum >= 50000 && n.likesNum < 100000)
      .length,
    "1-5万": data.filter((n) => n.likesNum >= 10000 && n.likesNum < 50000)
      .length,
    "5千-1万": data.filter((n) => n.likesNum >= 5000 && n.likesNum < 10000)
      .length,
    "5千以下": data.filter((n) => n.likesNum < 5000).length,
  };

  // 添加标题分析
  const titleAnalysis = {
    // 标题长度分析
    lengthStats: {
      avg: Math.round(
        data.reduce((sum, note) => sum + note.title.length, 0) / data.length
      ),
      distribution: {
        "短标题(<=15字)": data.filter((n) => n.title.length <= 15).length,
        "中等标题(16-25字)": data.filter(
          (n) => n.title.length > 15 && n.title.length <= 25
        ).length,
        "长标题(>25字)": data.filter((n) => n.title.length > 25).length,
      },
    },

    // 标题开头词分析
    startWords: data.reduce((acc, note) => {
      const firstWord = note.title.split(/[\s,，。！？!?]/)[0];
      if (firstWord && firstWord.length >= 2) {
        acc[firstWord] = (acc[firstWord] || 0) + 1;
      }
      return acc;
    }, {}),

    // 标题特征分析
    features: {
      hasEmoji: data.filter((n) =>
        /[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(n.title)
      ).length,
      hasNumber: data.filter((n) => /\d+/.test(n.title)).length,
      hasQuestion: data.filter((n) => /[？?]/.test(n.title)).length,
      hasExclamation: data.filter((n) => /[！!]/.test(n.title)).length,
    },

    // 高赞标题分析（取前20%的笔记作为高赞样本）
    topPerformers: data
      .slice(0, Math.max(5, Math.floor(data.length * 0.2)))
      .map((note) => ({
        title: note.title,
        likes: note.likesNum,
      })),
  };

  return {
    stats,
    topAuthors,
    topKeywords,
    likesDistribution,
    titleAnalysis,
  };
}

// 添加 Tab 切换功能
function addTabs() {
  const tabsHtml = `
    <div class="tabs" style="
      display: flex;
      margin-bottom: 15px;
      border-bottom: 1px solid #eee;
    ">
      <div id="currentTab" class="tab active" style="
        padding: 8px 16px;
        cursor: pointer;
        color: #ff2442;
        border-bottom: 2px solid #ff2442;
        font-weight: 500;
      ">当前分析</div>
      <div id="historyTab" class="tab" style="
        padding: 8px 16px;
        cursor: pointer;
        color: #666;
      ">历史记录</div>
    </div>
  `;

  // 移除原有的历史记录按钮
  const historyButton = document.getElementById("historyButton");
  if (historyButton) {
    historyButton.remove();
  }

  // 添加 tabs 到结果区域顶部
  const resultDiv = document.getElementById("result");
  const tabsDiv = document.createElement("div");
  tabsDiv.innerHTML = tabsHtml;
  resultDiv.insertBefore(tabsDiv, resultDiv.firstChild);

  // 添加内容容器
  const contentDiv = document.createElement("div");
  contentDiv.id = "contentContainer";
  resultDiv.appendChild(contentDiv);

  // 添加 tab 切换事件
  document.getElementById("currentTab").addEventListener("click", async () => {
    setActiveTab("currentTab");
    showCurrentAnalysis();
  });

  document.getElementById("historyTab").addEventListener("click", async () => {
    setActiveTab("historyTab");
    showHistoryView();
  });
}

// 设置活动 tab 样式
function setActiveTab(activeTabId) {
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach((tab) => {
    if (tab.id === activeTabId) {
      tab.style.color = "#ff2442";
      tab.style.borderBottom = "2px solid #ff2442";
      tab.style.fontWeight = "500";
    } else {
      tab.style.color = "#666";
      tab.style.borderBottom = "none";
      tab.style.fontWeight = "normal";
    }
  });
}

// 显示当前分析内容
function showCurrentAnalysis() {
  const contentDiv = document.getElementById("contentContainer");
  const currentData = contentDiv.dataset.currentData;
  const currentAnalysis = contentDiv.dataset.currentAnalysis;

  if (currentData && currentAnalysis) {
    const data = JSON.parse(currentData);
    const analysis = JSON.parse(currentAnalysis);
    displayResults(data, false); // 添加参数表示不需要重新创建 tabs
  } else {
    contentDiv.innerHTML = "<p>暂无分析数据，请先进行分析。</p>";
  }
}

// 显示历史记录视图
async function showHistoryView() {
  const contentDiv = document.getElementById("contentContainer");
  const result = await chrome.storage.local.get("analysisHistory");

  if (result.analysisHistory && result.analysisHistory.length > 0) {
    contentDiv.innerHTML = displayHistory(result.analysisHistory);

    // 添加历史记录项点击事件
    document.querySelectorAll(".history-item").forEach((item) => {
      item.addEventListener("click", async () => {
        const recordId = item.dataset.recordId;
        const record = result.analysisHistory.find((r) => r.id === recordId);
        if (record) {
          // 保存当前显示的数据
          contentDiv.dataset.currentData = JSON.stringify(record.data);
          contentDiv.dataset.currentAnalysis = JSON.stringify(record.analysis);

          // 高亮选中的记录
          document.querySelectorAll(".history-item").forEach((el) => {
            el.style.border = "none";
            el.style.background = "#f8f8f8";
          });
          item.style.border = "2px solid #ff2442";
          item.style.background = "#fff5f5";

          // 显示导出按钮
          const exportButton = document.getElementById("exportButton");
          exportButton.style.display = "block";
          exportButton.textContent = `📊 导出 ${new Date(
            record.timestamp
          ).toLocaleDateString()} 的数据`;
        }
      });

      // 添加悬停效果
      item.addEventListener("mouseenter", () => {
        item.style.transform = "translateY(-2px)";
        item.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
      });

      item.addEventListener("mouseleave", () => {
        item.style.transform = "translateY(0)";
        item.style.boxShadow = "none";
      });
    });
  } else {
    contentDiv.innerHTML = "<p>暂无历史记录。</p>";
  }
}

// 修改 displayResults 函数
function displayResults(data, createTabs = true) {
  const resultDiv = document.getElementById("result");

  if (!data || data.length === 0) {
    resultDiv.innerHTML =
      "<p>未找到笔记数据，请确保在小红书搜索结果页面使用。</p>";
    return;
  }

  // 生成分析报告
  const analysis = analyzeData(data);

  // 如果是首次显示，创建 tabs
  if (createTabs) {
    resultDiv.innerHTML = "";
    addTabs();
  }

  const contentDiv = document.getElementById("contentContainer");

  // 保存当前数据用于导出
  contentDiv.dataset.currentData = JSON.stringify(data);
  contentDiv.dataset.currentAnalysis = JSON.stringify(analysis);

  let html = `
    <h3>数据分析报告</h3>
    
    <div class="stats-container">
      <div class="stat-item">
        📊 共分析 <span class="stat-highlight">${
          analysis.stats.totalNotes
        }</span> 篇笔记
      </div>
      <div class="stat-item">
        ❤️ 总点赞数 <span class="stat-highlight">${(
          analysis.stats.totalLikes / 10000
        ).toFixed(1)}万</span>
      </div>
      <div class="stat-item">
        📈 平均点赞 <span class="stat-highlight">${(
          analysis.stats.avgLikes / 10000
        ).toFixed(1)}万</span>
      </div>
      <div class="stat-item">
        📹 视频笔记 <span class="stat-highlight">${
          analysis.stats.videoCount
        }</span> 篇
        (${Math.round(
          (analysis.stats.videoCount / analysis.stats.totalNotes) * 100
        )}%)
      </div>
    </div>

    <div class="analysis-section">
      <h4>🏆 活跃创作者</h4>
      ${analysis.topAuthors
        .map(
          ([author, count], index) => `
        <div class="stat-item">
          Top${index + 1}: ${author} (${count}篇笔记)
        </div>
      `
        )
        .join("")}
    </div>

    <div class="analysis-section">
      <h4>🔍 热门关键词</h4>
      <div class="tag-cloud">
        ${analysis.topKeywords
          .map(
            ([word, count]) => `
          <span class="tag">${word} (${count})</span>
        `
          )
          .join("")}
      </div>
    </div>

    <div class="analysis-section">
      <h4>📊 点赞分布</h4>
      ${Object.entries(analysis.likesDistribution)
        .map(
          ([range, count]) => `
        <div class="stat-item">
          ${range}: ${count}篇 (${Math.round(
            (count / analysis.stats.totalNotes) * 100
          )}%)
        </div>
      `
        )
        .join("")}
    </div>

    <div class="analysis-section">
      <h4>📝 爆款标题分析</h4>
      
      <div class="stat-item">
        <strong>标题长度分析</strong>
        <p>平均长度：${analysis.titleAnalysis.lengthStats.avg}字</p>
        ${Object.entries(analysis.titleAnalysis.lengthStats.distribution)
          .map(
            ([type, count]) => `
            <div>${type}: ${count}篇 (${Math.round(
              (count / data.length) * 100
            )}%)</div>
          `
          )
          .join("")}
      </div>

      <div class="stat-item">
        <strong>标题特征</strong>
        <div>使用表情符号: ${
          analysis.titleAnalysis.features.hasEmoji
        }篇 (${Math.round(
    (analysis.titleAnalysis.features.hasEmoji / data.length) * 100
  )}%)</div>
        <div>包含数字: ${
          analysis.titleAnalysis.features.hasNumber
        }篇 (${Math.round(
    (analysis.titleAnalysis.features.hasNumber / data.length) * 100
  )}%)</div>
        <div>使用问句: ${
          analysis.titleAnalysis.features.hasQuestion
        }篇 (${Math.round(
    (analysis.titleAnalysis.features.hasQuestion / data.length) * 100
  )}%)</div>
        <div>使用感叹句: ${
          analysis.titleAnalysis.features.hasExclamation
        }篇 (${Math.round(
    (analysis.titleAnalysis.features.hasExclamation / data.length) * 100
  )}%)</div>
      </div>

      <div class="stat-item">
        <strong>常用开头词 (Top 5)</strong>
        <div class="tag-cloud">
          ${Object.entries(analysis.titleAnalysis.startWords)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(
              ([word, count]) => `
              <span class="tag">${word} (${count})</span>
            `
            )
            .join("")}
        </div>
      </div>

      <div class="stat-item">
        <strong>高赞标题示例</strong>
        ${analysis.titleAnalysis.topPerformers
          .map(
            (note, index) => `
            <div style="margin: 5px 0; padding: 5px; background: #fff5f5; border-radius: 4px;">
              ${index + 1}. ${note.title}
              <div style="color: #ff2442; font-size: 12px;">
                ${
                  note.likes >= 10000
                    ? `${(note.likes / 10000).toFixed(1)}万赞`
                    : `${note.likes}赞`
                }
              </div>
            </div>
          `
          )
          .join("")}
      </div>
    </div>

    <h3>笔记详情（按点赞量排序）</h3>
  `;

  // 添加原有的笔记列表
  data.forEach((note, index) => {
    html += `
      <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
        <div style="display: flex; align-items: start; gap: 10px;">
          <img src="${
            note.coverImage
          }" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px;" />
          <div>
            <h4>Top ${index + 1} ${note.isVideo ? "📹" : "📷"}</h4>
            <p><strong>标题：</strong> ${note.title}</p>
            <div style="display: flex; align-items: center; gap: 8px;">
              <img src="${
                note.authorAvatar
              }" style="width: 20px; height: 20px; border-radius: 50%;" />
              <p><strong>作者：</strong> ${note.author}</p>
            </div>
            <p><strong>点赞：</strong> ${note.likes} ${
      note.likesNum >= 10000 ? `(${(note.likesNum / 10000).toFixed(1)}万)` : ""
    }</p>
            <a href="${
              note.link
            }" target="_blank" style="color: #ff2442; text-decoration: none;">查看笔记 →</a>
          </div>
        </div>
      </div>
    `;
  });

  contentDiv.innerHTML = html; // 使用 contentDiv 而不是 resultDiv
}

// 修改导出函数
function exportToExcel(data, analysis) {
  try {
    // 检查 XLSX 是否存在
    if (typeof XLSX === "undefined") {
      throw new Error("XLSX 库未加载，请检查 xlsx.full.min.js 文件");
    }

    // 验证 XLSX 的关键方法是否可用
    if (!XLSX.utils || !XLSX.utils.book_new || !XLSX.utils.json_to_sheet) {
      throw new Error("XLSX 库加载不完整，缺少必要的方法");
    }

    console.log("XLSX 库加载成功，开始导出...");

    // 准备笔记数据
    const notesData = data.map((note, index) => ({
      排名: index + 1,
      标题: note.title,
      作者: note.author,
      点赞数: note.likesNum,
      类型: note.isVideo ? "视频" : "图文",
      链接: note.link,
      标题长度: note.title.length,
      包含表情: /[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(note.title) ? "是" : "否",
      包含数字: /\d+/.test(note.title) ? "是" : "否",
      包含问号: /[？?]/.test(note.title) ? "是" : "否",
      包含感叹号: /[！!]/.test(note.title) ? "是" : "否",
    }));

    // 准备统计数据
    const statsData = [
      {
        总笔记数: analysis.stats.totalNotes,
        总点赞数: analysis.stats.totalLikes,
        平均点赞数: analysis.stats.avgLikes,
        视频数量: analysis.stats.videoCount,
        图文数量: analysis.stats.imageCount,
        平均标题长度: analysis.titleAnalysis.lengthStats.avg,
      },
    ];

    // 准备点赞分布数据
    const distributionData = Object.entries(analysis.likesDistribution).map(
      ([range, count]) => ({
        点赞范围: range,
        笔记数量: count,
        占比: `${Math.round((count / analysis.stats.totalNotes) * 100)}%`,
      })
    );

    // 准备热门关键词数据
    const keywordsData = analysis.topKeywords.map(([word, count]) => ({
      关键词: word,
      出现次数: count,
    }));

    // 创建工作簿
    const wb = XLSX.utils.book_new();

    // 添加笔记数据表
    const wsNotes = XLSX.utils.json_to_sheet(notesData);
    XLSX.utils.book_append_sheet(wb, wsNotes, "笔记数据");

    // 添加统计数据表
    const wsStats = XLSX.utils.json_to_sheet(statsData);
    XLSX.utils.book_append_sheet(wb, wsStats, "统计数据");

    // 添加分布数据表
    const wsDistribution = XLSX.utils.json_to_sheet(distributionData);
    XLSX.utils.book_append_sheet(wb, wsDistribution, "点赞分布");

    // 添加关键词数据表
    const wsKeywords = XLSX.utils.json_to_sheet(keywordsData);
    XLSX.utils.book_append_sheet(wb, wsKeywords, "热门关键词");

    // 生成二进制数据
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });

    // 转换为 Blob
    const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });

    // 创建下载 URL
    const url = URL.createObjectURL(blob);

    // 使用 Chrome 下载 API
    const fileName = `小红书笔记分析_${new Date().toLocaleDateString()}.xlsx`;
    chrome.downloads.download({
      url: url,
      filename: fileName,
      saveAs: true,
    });
  } catch (error) {
    console.error("导出错误:", error);
    alert("导出失败，请检查控制台获取详细错误信息");
  }
}

// 辅助函数：将字符串转换为 ArrayBuffer
function s2ab(s) {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < s.length; i++) {
    view[i] = s.charCodeAt(i) & 0xff;
  }
  return buf;
}

// 修改导出按钮事件监听
document.getElementById("exportButton").addEventListener("click", () => {
  // 获取当前显示的数据
  const contentDiv = document.getElementById("contentContainer");
  if (!contentDiv.dataset.currentData || !contentDiv.dataset.currentAnalysis) {
    alert("请先选择要导出的数据！");
    return;
  }

  try {
    const data = JSON.parse(contentDiv.dataset.currentData);
    const analysis = JSON.parse(contentDiv.dataset.currentAnalysis);
    exportToExcel(data, analysis);
  } catch (error) {
    console.error("导出错误:", error);
    alert("导出失败，请检查控制台获取详细错误信息");
  }
});

// 修改保存分析结果的函数
async function saveAnalysisResult(data) {
  try {
    const analysis = analyzeData(data);
    const newRecord = {
      data,
      analysis,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      id: Date.now().toString(), // 添加唯一ID
    };

    // 获取现有历史记录
    const result = await chrome.storage.local.get([
      "analysisHistory",
      "lastAnalysis",
    ]);
    const history = result.analysisHistory || [];

    // 限制历史记录数量为最近10条
    history.unshift(newRecord);
    if (history.length > 10) {
      history.pop();
    }

    // 保存历史记录和最新分析
    await chrome.storage.local.set({
      analysisHistory: history,
      lastAnalysis: newRecord,
    });
  } catch (error) {
    console.error("保存分析结果失败:", error);
  }
}

// 修改历史记录按钮位置和样式
function addHistoryButton() {
  const button = document.createElement("button");
  button.id = "historyButton";
  button.innerHTML = `
    <div style="display: flex; align-items: center; gap: 6px;">
      <span style="font-size: 16px;">📋</span>
      <span>历史记录</span>
    </div>
  `;
  button.style.cssText = `
    width: 100%;
    padding: 10px;
    background-color: #ff9999;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 10px;
    transition: all 0.2s ease;
  `;

  button.addEventListener("mouseenter", () => {
    button.style.backgroundColor = "#ff8080";
  });

  button.addEventListener("mouseleave", () => {
    button.style.backgroundColor = "#ff9999";
  });

  // 添加到分析按钮下方
  const analyzeButton = document.getElementById("analyzeButton");
  analyzeButton.parentNode.insertBefore(button, analyzeButton.nextSibling);
}

// 修改历史记录面板样式
function displayHistory(history) {
  const historyHtml = history
    .map((record, index) => {
      const date = new Date(record.timestamp);
      const timeString = date.toLocaleString();
      const stats = record.analysis.stats;

      return `
      <div class="history-item stats-container" style="
        cursor: pointer;
        transition: all 0.2s ease;
      " data-record-id="${record.id}">
        <div class="stat-item">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: bold;">分析记录 #${index + 1}</span>
            <span style="font-size: 12px; color: #666;">${timeString}</span>
          </div>
        </div>
        <div class="stat-item" style="
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-top: 10px;
        ">
          <div>
            <span class="stat-highlight">📊 ${stats.totalNotes}</span> 篇笔记
          </div>
          <div>
            <span class="stat-highlight">❤️ ${(stats.avgLikes / 10000).toFixed(
              1
            )}</span> 万平均点赞
          </div>
        </div>
      </div>
    `;
    })
    .join("");

  return `
    <div class="history-section" style="margin-top: 20px;">
      <h3 style="margin-bottom: 15px;">历史记录</h3>
      <div style="color: #666; font-size: 12px; margin-bottom: 10px;">
        点击记录查看详情
      </div>
      ${historyHtml}
    </div>
  `;
}

// 修改历史记录的显示逻辑
document.addEventListener("DOMContentLoaded", async () => {
  // 初始化结果区域
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "";
  addTabs();

  // 加载上次分析结果
  const result = await chrome.storage.local.get("lastAnalysis");
  if (result.lastAnalysis) {
    const { data } = result.lastAnalysis;
    displayResults(data, false);
  } else {
    document.getElementById("contentContainer").innerHTML =
      "<p>暂无分析数据，请先进行分析。</p>";
  }
});
