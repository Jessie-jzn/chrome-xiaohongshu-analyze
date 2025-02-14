// UI 相关功能
import { analyzeData } from "./analyzer.js";
import { generateCharts } from "./charts.js";
import { loadHistory } from "./storage.js";

export function addTabs() {
  const tabsHtml = `
    <div class="tabs">
      <button class="tab-button active" data-tab="overview">📊 概览</button>
      <button class="tab-button" data-tab="charts">📈 图表</button>
      <button class="tab-button" data-tab="history">📋 历史</button>
    </div>
    <div class="tab-content"></div>
  `;

  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = tabsHtml;
  addTabEventListeners();
}

export function displayResults(data, createTabs = true) {
  const analysis = analyzeData(data);
  const contentDiv = document.getElementById("contentContainer");
  if (!contentDiv) return;

  // 如果已经有标签页了，就不需要重新创建
  if (!document.querySelector(".tabs")) {
    addTabs();
  }

  // 直接显示概览内容
  showOverviewTab(data, analysis);
}

// 显示概览标签内容
function showOverviewTab(data, analysis) {
  const contentDiv = document.getElementById("contentContainer");
  const html = `
    <div class="analysis-section">
      <div class="stats-container">
        <div class="stat-item">
          <span class="stat-highlight">${
            analysis.stats.totalNotes
          }</span> 篇笔记
        </div>
        <div class="stat-item">
          <span class="stat-highlight">${(
            analysis.stats.avgLikes / 10000
          ).toFixed(1)}</span> 万平均点赞
        </div>
        <div class="stat-item">
          <span class="stat-highlight">${
            analysis.stats.videoCount
          }</span> 个视频
          <span class="stat-highlight">${
            analysis.stats.imageCount
          }</span> 篇图文
        </div>
      </div>
    </div>

    <div class="analysis-section">
      <h4>🔍 标题分析</h4>
      <div class="stat-item">
        平均标题长度: <span class="stat-highlight">${
          analysis.titleAnalysis.avgLength
        }</span> 字
      </div>
      <div class="stat-item">
        包含数字: <span class="stat-highlight">${
          analysis.titleAnalysis.patterns.hasNumber
        }%</span>
      </div>
      <div class="stat-item">
        包含表情: <span class="stat-highlight">${
          analysis.titleAnalysis.patterns.hasEmoji
        }%</span>
      </div>
    </div>

    <div class="analysis-section">
      <h4>🔤 热门关键词</h4>
      <div class="tag-cloud">
        ${analysis.topKeywords
          .map(
            (item) =>
              `<span class="tag">${item.keyword} (${item.count}次)</span>`
          )
          .join("")}
      </div>
    </div>

    <div class="analysis-section">
      <h4>📝 笔记列表</h4>
      <div class="notes-list">
        ${data
          .map(
            (note, index) => `
          <div class="note-item">
            <div class="note-cover">
              <img src="${note.cover || "images/placeholder.png"}" alt="${
              note.title
            }" onerror="this.src='images/placeholder.png'">
            </div>
            <div class="note-content">
              <div class="note-title">
                <span class="content-type-tag">${
                  note.isVideo ? "📹 视频" : "📷 图文"
                }</span>
                <a href="${note.link}" target="_blank">${note.title}</a>
              
              </div>
              <div class="note-info">
                <span class="note-author">👤 ${note.author}</span>
              </div>
              <div class="note-likes">
                <span class="note-likes">❤️ ${
                  note.likesNum > 10000
                    ? `${(note.likesNum / 10000).toFixed(1)}万`
                    : note.likesNum
                }</span>
              </div>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    </div>

    <div class="analysis-section">
      <h4>👤 作者分析</h4>
      <div class="author-analysis">
        <div class="author-header">
          <div class="author-info">
            <img src="${
              analysis.authorAnalysis.authorAvatar
            }" class="author-avatar" />
            <h3>${analysis.authorAnalysis.author}</h3>
          </div>
          <a href="https://www.xiaohongshu.com/user/profile/${
            analysis.authorAnalysis.authorId
          }" target="_blank" class="author-link">查看主页</a>
        </div>
        
        <div class="stats-container">
          <div class="stat-item">
            📊 发布频率：<span class="stat-highlight">${
              analysis.authorAnalysis.stats.postFrequency
            }</span> 篇/天
          </div>
          <div class="stat-item">
            ❤️ 平均互动率：<span class="stat-highlight">${
              analysis.authorAnalysis.stats.interactionRate
            }</span>%
          </div>
          <div class="stat-item">
            📹 视频占比：<span class="stat-highlight">${
              analysis.authorAnalysis.stats.contentPreference.video
            }</span>%
          </div>
          <div class="stat-item">
            📷 图文占比：<span class="stat-highlight">${
              analysis.authorAnalysis.stats.contentPreference.image
            }</span>%
          </div>
        </div>
        
        <div class="weekday-stats">
          <h4>📅 发文时间分布</h4>
          <div class="weekday-chart">
            ${analysis.authorAnalysis.stats.weekdayStats
              .map(
                (stat) => `
              <div class="weekday-bar">
                <div class="bar" style="height: ${stat.percentage}%"></div>
                <div class="day">${stat.day}</div>
                <div class="count">${stat.count}篇</div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>

      </div>
    </div>

    <div class="analysis-section">
      <h4>🔥 爆文潜力预测</h4>
      <div class="hot-predictions">
        ${analysis.hotPredictions
          .map(
            (post, index) => `
          <div class="prediction-item">
            <div class="prediction-rank">#${index + 1}</div>
            <div class="prediction-content">
              <div class="prediction-title">${post.title}</div>
              <div class="prediction-stats">
                <span>潜力指数: ${post.prediction.potentialScore}</span>
                <span>互动率: ${(post.prediction.engagementRate * 100).toFixed(
                  2
                )}%</span>
                <span>${post.isVideo ? "📹 视频" : "📷 图文"}</span>
              </div>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    </div>
    
    <div class="analysis-section">
      <h4>🔍 深度关键词分析</h4>
      <div class="keyword-cloud">
        ${analysis.keywordAnalysis
          .map(
            (item) => `
          <span class="keyword-item" style="font-size: ${
            12 + item.count * 2
          }px">
            ${item.keyword} (${item.count})
          </span>
        `
          )
          .join("")}
      </div>
    </div>

    <div class="analysis-section">
      <h4>🎯 博主定位分析</h4>
      
      ${
        analysis.influencerAnalysis
          ? `
        <div class="position-card">
          <h5>1. 输出内容</h5>
          <div class="content-analysis">
            <div class="main-topics">
              <h6>主要话题</h6>
              ${
                analysis.influencerAnalysis.contentOutput.mainTopics
                  ?.map((topic) => `<span class="topic-tag">${topic}</span>`)
                  .join("") || "暂无数据"
              }
            </div>
            <div class="target-audience">
              <h6>目标受众</h6>
              <p>${
                analysis.influencerAnalysis.contentOutput.targetAudience
                  ?.description || "暂无数据"
              }</p>
            </div>
          </div>
        </div>

        <div class="position-card">
          <h5>2. 身份角色</h5>
          <div class="role-analysis">
            <div class="profession">
              <span class="label">职业身份：</span>
              <span class="value">${
                analysis.influencerAnalysis.roleIdentity?.profession ||
                "暂无数据"
              }</span>
            </div>
            <div class="expertise">
              <span class="label">专业领域：</span>
              <span class="value">${
                analysis.influencerAnalysis.roleIdentity?.expertise?.join(
                  ", "
                ) || "暂无数据"
              }</span>
            </div>
          </div>
        </div>

        <div class="position-card">
          <h5>3. 变现路径</h5>
          <div class="monetization-analysis">
            <div class="commercial-value">
              <h6>商业价值评估</h6>
              <div class="value-score">
                <div class="score-bar" style="width: ${
                  analysis.influencerAnalysis.monetization?.commercialValue || 0
                }%"></div>
                <span class="score-text">${
                  analysis.influencerAnalysis.monetization?.commercialValue || 0
                }分</span>
              </div>
            </div>
            <div class="channels">
              <h6>主要变现渠道</h6>
              <ul>
                ${
                  analysis.influencerAnalysis.monetization?.monetizationChannels
                    ?.map(
                      (channel) =>
                        `<li>${channel.name}: ${channel.percentage}%</li>`
                    )
                    .join("") || "<li>暂无数据</li>"
                }
              </ul>
            </div>
          </div>
        </div>

        <div class="position-card">
          <h5>4. 核心优势</h5>
          <div class="advantages-analysis">
            ${
              analysis.influencerAnalysis.uniquePoints?.uniqueFeatures?.contentFeatures
                ?.map(
                  (feature) => `<span class="feature-tag">${feature}</span>`
                )
                .join("") || "暂无数据"
            }
          </div>
        </div>

        <div class="position-card">
          <h5>5. 发展策略</h5>
          <div class="strategy-analysis">
            <div class="strategy-item">
              <h6>短期目标</h6>
              <ul>
                ${
                  analysis.influencerAnalysis.coreTrack?.growthStrategy?.shortTerm
                    ?.map((item) => `<li>${item}</li>`)
                    .join("") || "<li>暂无数据</li>"
                }
              </ul>
            </div>
            <div class="strategy-item">
              <h6>中期目标</h6>
              <ul>
                ${
                  analysis.influencerAnalysis.coreTrack?.growthStrategy?.midTerm
                    ?.map((item) => `<li>${item}</li>`)
                    .join("") || "<li>暂无数据</li>"
                }
              </ul>
            </div>
          </div>
        </div>
      `
          : "<p>暂无博主定位分析数据</p>"
      }
    </div>
  `;

  contentDiv.innerHTML = html;

  // 等待 DOM 更新后生成图表
  requestAnimationFrame(() => {
    setTimeout(() => {
      try {
        generateCharts(data, analysis);
      } catch (error) {
        console.error("显示图表时出错:", error);
      }
    }, 100);
  });
}

function showChartsTab(data, analysis) {
  const contentDiv = document.getElementById("contentContainer");
  const html = `
    <div class="analysis-section">
      <h4>📈 点赞分布</h4>
      <div class="chart-wrapper">
        <canvas id="likesChart"></canvas>
      </div>
    </div>

    <div class="analysis-section">
      <h4>📊 内容类型</h4>
      <div class="chart-wrapper">
        <canvas id="contentTypeChart"></canvas>
      </div>
    </div>

    <div class="analysis-section">
      <h4>📅 发布趋势</h4>
      <div class="chart-wrapper">
        <canvas id="trendsChart"></canvas>
      </div>
    </div>
  `;

  contentDiv.innerHTML = html;

  // 等待 DOM 更新后生成图表
  requestAnimationFrame(() => {
    setTimeout(() => {
      try {
        generateCharts(data, analysis);
      } catch (error) {
        console.error("显示图表时出错:", error);
      }
    }, 100);
  });
}

function addTabEventListeners() {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", async () => {
      // 移除所有活动状态
      document.querySelectorAll(".tab-button").forEach((btn) => {
        btn.classList.remove("active");
      });

      // 添加当前活动状态
      button.classList.add("active");

      // 获取最新分析数据
      const result = await chrome.storage.local.get("lastAnalysis");
      const { data } = result.lastAnalysis || {};
      const analysis = data ? analyzeData(data) : null;

      // 显示相应内容
      const tabName = button.dataset.tab;
      if (tabName === "overview") {
        if (analysis) {
          showOverviewTab(data, analysis);
        } else {
          contentDiv.innerHTML = "<p>暂无分析数据，请先进行分析。</p>";
        }
      } else if (tabName === "charts") {
        if (data && analysis) {
          showChartsTab(data, analysis);
        } else {
          contentDiv.innerHTML = "<p>暂无图表数据，请先进行分析。</p>";
        }
      } else if (tabName === "history") {
        displayHistory();
      }
    });
  });
}

async function displayHistory() {
  const history = await loadHistory();
  const contentDiv = document.getElementById("contentContainer");

  if (!history || history.length === 0) {
    contentDiv.innerHTML = "<p>暂无历史记录</p>";
    return;
  }

  const historyHtml = history
    .map((record, index) => {
      const date = new Date(record.timestamp);
      const timeString = date.toLocaleString();
      const stats = record.analysis.stats;

      return `
        <div class="history-item" data-record-id="${record.id}">
          <div class="history-header">
            <span class="history-title">分析记录 #${index + 1}</span>
            <span class="history-time">${timeString}</span>
          </div>
          <div class="history-stats">
            <div class="stat-item">
              <span class="stat-highlight">${stats.totalNotes}</span> 篇笔记
            </div>
            <div class="stat-item">
              <span class="stat-highlight">${(stats.avgLikes / 10000).toFixed(
                1
              )}</span> 万平均点赞
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  contentDiv.innerHTML = historyHtml;
  addHistoryEventListeners();
}

function addHistoryEventListeners() {
  document.querySelectorAll(".history-item").forEach((item) => {
    item.addEventListener("click", async () => {
      const recordId = item.dataset.recordId;
      const history = await loadHistory();
      const record = history.find((r) => r.id === recordId);

      if (record) {
        displayResults(record.data, true);
        // 切换到概览标签
        document.querySelector('[data-tab="overview"]').click();
      }
    });
  });
}
