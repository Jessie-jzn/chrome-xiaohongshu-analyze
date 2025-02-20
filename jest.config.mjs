export default {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  moduleNameMapper: {
    // 处理 ES 模块导入
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    // 使用 babel 转换 ES 模块
    "^.+\\.js$": "babel-jest",
  },
  moduleFileExtensions: ["js", "mjs", "cjs", "jsx", "json"],
  // 移除自动模拟设置
  moduleDirectories: ["node_modules"],
};
