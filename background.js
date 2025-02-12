chrome.runtime.onInstalled.addListener(() => {
  // 开发模式下启用热重载
  if (chrome.runtime.getManifest().version_name === "dev") {
    chrome.tabs.create({ url: "chrome://extensions" });
    chrome.runtime.reload();
  }
});

// 监听文件变化
let lastReload = Date.now();
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "RELOAD" && Date.now() - lastReload > 1000) {
    lastReload = Date.now();
    chrome.runtime.reload();
  }
});
