chrome.runtime.onInstalled.addListener(() => {
  console.log("小红书AI优化助手已安装");
});

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content.js"],
  });
});
