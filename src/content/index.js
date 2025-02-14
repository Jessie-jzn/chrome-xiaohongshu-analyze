console.log("Content script loaded");

// 提取页面数据
function extractData() {
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
      console.log("Title element:", titleEl);

      // 点赞数
      const likesEl = post.querySelector(".like-wrapper .count");
      console.log("Likes element:", likesEl);

      // 作者
      const authorEl = post.querySelector(".author .name");
      // 封面图
      const coverEl = post.querySelector(".cover img");
      // 链接
      const linkEl = post.querySelector("a[href^='/explore/']");
      // 是否视频（通过图片尺寸判断）
      const imageStyle = coverEl?.getAttribute("style") || "";
      const isVideo = imageStyle.includes("object-fit: contain");

      return {
        title: titleEl?.textContent?.trim() || "",
        likes: parseInt(
          likesEl?.textContent?.replace(/[^0-9]/g, "") || "0",
          10
        ),
        isVideo,
        author: authorEl?.textContent?.trim() || "",
        cover: coverEl?.src || "",
        link: linkEl?.href || "",
        noteId: linkEl?.href?.split("/")?.pop() || "",
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
