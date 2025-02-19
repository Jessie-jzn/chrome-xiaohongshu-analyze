console.log("Content script loaded");

// 提取页面数据
function extractData() {
  console.log("Extracting data...");
  try {
    // 等待页面加载完成
    if (document.readyState !== "complete") {
      return null;
    }

    // 使用小红书的实际选择器
    const elements = document.querySelectorAll("section.note-item");
    console.log("Found elements:", elements.length);

    const posts = Array.from(elements).map((post) => {
      // 标题
      const titleEl = post.querySelector(".title span");
      const title = titleEl ? titleEl.textContent.trim() : "";

      // 点赞数
      const likesEl = post.querySelector(".like-wrapper .count");
      const likes = likesEl
        ? parseInt(likesEl.textContent.replace(/[^0-9]/g, "") || "0", 10)
        : 0;

      // 作者
      const authorEl = post.querySelector(".author .name");
      const author = authorEl ? authorEl.textContent.trim() : "";

      // 封面图
      const coverEl = post.querySelector(".cover img");
      const cover = coverEl ? coverEl.src : "";

      // 链接
      const linkEl = post.querySelector("a[href^='/explore/']");
      const link = linkEl ? linkEl.href : "";

      // 是否视频（通过图片尺寸判断）
      const isVideo = post.querySelector(".video-container") !== null;

      return {
        title,
        likes,
        isVideo,
        author,
        cover,
        link,
      };
    });

    console.log("Extracted posts:", posts);
    return posts;
  } catch (err) {
    console.error("Data extraction failed:", err);
    return null;
  }
}

// 监听消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received message:", request);

  if (request.action === "extract") {
    // 如果页面还没加载完，等待后重试
    if (document.readyState !== "complete") {
      setTimeout(() => {
        const data = extractData();
        console.log("Extracted data:", data);
        if (data) {
          sendResponse({ data: data.slice(0, request.count || 50) });
        } else {
          sendResponse({ error: "页面数据未准备好" });
        }
      }, 1000);
    } else {
      const data = extractData();
      console.log("Extracted data:", data);
      if (data) {
        sendResponse({ data: data.slice(0, request.count || 50) });
      } else {
        sendResponse({ error: "无法获取数据" });
      }
    }
    return true; // 保持消息通道开放
  }
});

// 初始化
console.log("Content script initialized, readyState:", document.readyState);
