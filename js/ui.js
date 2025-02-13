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
    <div id="contentContainer"></div>
  `;

  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = tabsHtml;
  addTabEventListeners();
}

export function displayResults(data, createTabs = true) {
  const analysis = analyzeData(data);
  const contentDiv = document.getElementById("contentContainer");
  if (!contentDiv) return;

  // 如果需要创建标签页
  if (createTabs) {
    const tabsHtml = `
      <div class="tabs">
        <button class="tab-button active" data-tab="overview">📊 概览</button>
        <button class="tab-button" data-tab="charts">📈 图表</button>
        <button class="tab-button" data-tab="history">📋 历史</button>
      </div>
    `;
    contentDiv.innerHTML = tabsHtml;
    addTabEventListeners();
    showOverviewTab(data, analysis);
    return;
  }

  // 如果不需要创建标签页，直接显示笔记列表
  const html = `
    <div class="analysis-report">
      <h3>数据分析报告</h3>
      
      <div class="stats-container">
        <div class="stat-item">📊 共分析 <span class="stat-highlight">${
          analysis.stats.totalNotes
        }</span> 篇笔记</div>
        <div class="stat-item">❤️ 总点赞数 <span class="stat-highlight">${(
          analysis.stats.totalLikes / 10000
        ).toFixed(1)}</span> 万</div>
        <div class="stat-item">📈 平均点赞 <span class="stat-highlight">${(
          analysis.stats.avgLikes / 10000
        ).toFixed(1)}</span> 万</div>
        <div class="stat-item">📹 视频笔记 <span class="stat-highlight">${
          analysis.stats.videoCount
        }</span> 篇 (${Math.round(
    (analysis.stats.videoCount / analysis.stats.totalNotes) * 100
  )}%)</div>
      </div>

      <h4>🏆 活跃创作者</h4>
      <div class="top-authors">
        ${analysis.topAuthors
          .map(
            (author, index) => `
          <div class="author-item">
            Top${index + 1}: ${author.author} (${author.noteCount}篇笔记)
          </div>
        `
          )
          .join("")}
      </div>

      <h4>🔍 热门关键词</h4>
      <div class="hot-keywords">
        ${analysis.topKeywords
          .map(
            (keyword) => `
          <span class="keyword">${keyword.keyword} (${keyword.count})</span>
        `
          )
          .join("")}
      </div>

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
                <a href="${note.link}" target="_blank">${note.title}</a>
                ${note.isVideo ? '<span class="video-tag">视频</span>' : ""}
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
  `;

  contentDiv.innerHTML = html;
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
                <a href="${note.link}" target="_blank">${note.title}</a>
                ${note.isVideo ? '<span class="video-tag">视频</span>' : ""}
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
