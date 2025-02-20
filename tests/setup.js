import "@testing-library/jest-dom";
import { jest } from "@jest/globals";

// 模拟浏览器环境
globalThis.chrome = {
  tabs: {
    query: jest.fn(),
  },
  scripting: {
    executeScript: jest.fn(),
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
    },
  },
  runtime: {
    onMessage: {
      addListener: jest.fn(),
    },
  },
};
