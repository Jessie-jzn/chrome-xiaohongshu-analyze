chrome.runtime.onInstalled.addListener(() => {
  console.log("小红书AI优化助手已安装1");
});

// 监听文件变化
let lastReload = Date.now();
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "RELOAD" && Date.now() - lastReload > 1000) {
    lastReload = Date.now();
    chrome.runtime.reload();
  }
});

// 热重载逻辑
const filesInDirectory = (dir) =>
  new Promise((resolve) =>
    dir.createReader().readEntries((entries) =>
      Promise.all(
        entries
          .filter((e) => e.name[0] !== ".")
          .map((e) =>
            e.isDirectory
              ? filesInDirectory(e)
              : new Promise((resolve) => e.file(resolve))
          )
      )
        .then((files) => [].concat(...files))
        .then(resolve)
    )
  );

const timestampForFilesInDirectory = (dir) =>
  filesInDirectory(dir).then((files) =>
    files.map((f) => f.name + f.lastModifiedDate).join()
  );

const reload = () => {
  chrome.runtime.sendMessage({ type: "RELOAD" });
};

const watchChanges = (dir, lastTimestamp) => {
  timestampForFilesInDirectory(dir).then((timestamp) => {
    if (!lastTimestamp || lastTimestamp === timestamp) {
      setTimeout(() => watchChanges(dir, timestamp), 1000); // 每秒检查一次
    } else {
      reload();
    }
  });
};

chrome.management.getSelf((self) => {
  if (self.installType === "development") {
    chrome.runtime.getPackageDirectoryEntry((dir) => watchChanges(dir));
  }
});
