# 小红书笔记分析工具

一个帮助分析小红书笔记数据的 Chrome 扩展，提供数据分析、内容优化和趋势预测功能。

## 功能特点

- 📊 数据分析

  - 笔记数据统计
  - 互动数据分析
  - 内容类型分布
  - 发布时间分析

- 🎯 内容优化

  - 标题分析
  - 关键词提取
  - 爆文预测
  - 优化建议

- 📈 博主定位
  - 内容输出分析
  - 受众画像
  - 变现路径
  - 发展策略

## 技术栈

- ⚛️ React 18
- 🎨 Tailwind CSS
- 📦 Webpack 5
- 🔄 Chrome Extension API
- 📊 Chart.js

## 开发指南

### 环境要求

- Node.js >= 14
- npm >= 6

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 生产构建

```bash
npm run build
```

### 安装到 Chrome

1. 打开 Chrome 扩展管理页面 (chrome://extensions/)
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择项目的 `dist` 目录

## 项目结构

```
src/
├── manifest.json           # 插件配置
├── background/            # 后台服务
├── content/              # 内容脚本
├── popup/               # 弹窗界面
│   ├── components/    # UI组件
│   └── hooks/        # React Hooks
├── services/         # 核心服务
├── styles/          # 样式文件
└── utils/          # 工具函数
```

## 开发流程

1. 修改代码，保存文件
2. Webpack 自动重新构建
3. 扩展自动重新加载（热重载）
4. 在小红书网页测试功能

## 调试技巧

- 使用 Chrome DevTools 的 Console 面板
- 使用 React DevTools 调试组件
- 使用 Network 面板监控请求

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交改动
4. 发起 Pull Request

## 许可证

MIT License
