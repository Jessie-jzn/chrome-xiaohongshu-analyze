import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "../styles/index.css";

// 等待 DOM 加载完成
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("root");
  if (container) {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } else {
    console.error("Root element not found");
  }
});
