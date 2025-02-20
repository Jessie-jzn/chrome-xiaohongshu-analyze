// 添加调试日志
console.log("Content script loaded at:", new Date().toISOString());

// 确保内容脚本只在小红书页面上运行
if (window.location.hostname.includes("xiaohongshu.com")) {
  // 提取页面数据
  function extractData() {
    try {
      console.log("Extracting data, readyState:", document.readyState);

      // 使用小红书的实际选择器
      const elements = document.querySelectorAll("section.note-item");
      console.log("Found elements:", elements.length);

      if (elements.length === 0) {
        console.log("No elements found, trying alternative selectors...");
        // 尝试其他可能的选择器
        const alternativeElements = document.querySelectorAll(
          [
            ".note-item",
            ".feed-item",
            "[data-type='note']",
            ".explore-feed-item",
          ].join(",")
        );
        console.log("Found alternative elements:", alternativeElements.length);
        if (alternativeElements.length > 0) {
          elements = alternativeElements;
        }
      }

      const posts = Array.from(elements)
        .map((post, index) => {
          try {
            // 标题
            const titleEl =
              post.querySelector(".title span") ||
              post.querySelector(".content-title") ||
              post.querySelector(".desc");
            const title = titleEl ? titleEl.textContent.trim() : "";

            // 点赞数
            const likesEl =
              post.querySelector(".like-wrapper .count") ||
              post.querySelector(".like-count") ||
              post.querySelector("[data-type='like']");
            const likes = likesEl
              ? parseInt(likesEl.textContent.replace(/[^0-9]/g, "") || "0", 10)
              : 0;

            // 作者
            const authorEl =
              post.querySelector(".author .name") ||
              post.querySelector(".user-name") ||
              post.querySelector(".author-name");
            const author = authorEl ? authorEl.textContent.trim() : "";

            // 封面图
            const coverEl =
              post.querySelector(".cover img") ||
              post.querySelector(".note-cover") ||
              post.querySelector(".cover-image");
            const cover = coverEl ? coverEl.src : "";

            // 链接
            const linkEl =
              post.querySelector("a[href^='/explore/']") ||
              post.querySelector("a.note-link") ||
              post.closest("a");
            const link = linkEl ? linkEl.href : "";

            // 是否视频
            const isVideo =
              post.querySelector(".video-container") !== null ||
              post.querySelector(".video-icon") !== null ||
              post.hasAttribute("data-video");

            console.log(`Processed post ${index}:`, {
              title,
              likes,
              author,
              isVideo,
            });
            return { title, likes, isVideo, author, cover, link };
          } catch (error) {
            console.error(`Error processing post ${index}:`, error);
            return null;
          }
        })
        .filter(Boolean);

      console.log("Successfully extracted posts:", posts.length);
      return posts;
    } catch (err) {
      console.error("Data extraction failed:", err);
      return null;
    }
  }

  // 监听消息
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Content script received message:", request);

    if (request.action === "extract") {
      try {
        // 等待页面加载完成
        if (document.readyState !== "complete") {
          console.log("Page not ready, waiting...");
          setTimeout(() => {
            const data = extractData();
            console.log("Extracted data (delayed):", data);
            sendResponse({ data: data?.slice(0, request.count || 50) || null });
          }, 1000);
          return true; // 保持消息通道开放
        }

        const data = extractData();
        console.log("Extracted data (immediate):", data);
        sendResponse({ data: data?.slice(0, request.count || 50) || null });
      } catch (error) {
        console.error("Error in content script:", error);
        sendResponse({ error: error.message });
      }
      return true; // 保持消息通道开放
    }
  });

  // 初始化
  console.log("Content script initialized on xiaohongshu.com");
} else {
  console.log("Content script loaded but not on xiaohongshu.com");
}

// 初始化时打印页面状态
console.log("Content script initialized, readyState:", document.readyState);
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded event fired");
});
document.addEventListener("load", () => {
  console.log("Load event fired");
});
