// 注入到页面的脚本
console.log("Content script loaded");

// 提取页面数据
function extractData() {
  // ...
}

// 监听消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extract") {
    const data = extractData();
    sendResponse({ data });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  console.log("小红书数据分析插件启动");

  // 获取帖子数据
  let posts = document.querySelectorAll(".note-item");
  posts.forEach((post) => {
    let title = post.querySelector(".note-title").innerText;
    let likes = post.querySelector(".note-likes").innerText;
    console.log(`标题: ${title}, 点赞数: ${likes}`);
  });
});
