# 小红书笔记分析助手

一个帮助分析小红书笔记数据的 Chrome 扩展。

## 功能特点

- 批量分析笔记数据（支持 10-100 篇）
- 统计点赞、互动等核心指标
- 分析标题特征和关键词
- 导出详细 Excel 报告
- 保存历史分析记录

## 安装使用

1. 下载项目代码
2. 打开 Chrome 扩展管理页面 (`chrome://extensions/`)
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目文件夹

## 使用方法

1. 打开小红书搜索或个人主页
2. 点击扩展图标
3. 选择要分析的笔记数量
4. 点击"开始分析"
5. 查看分析报告或导出数据

## 项目结构

```
├── manifest.json // 扩展配置文件
├── popup.html // 弹窗界面
├── popup.js // 弹窗逻辑
├── background.js // 后台脚本
├── xlsx.full.min.js // Excel导出库
└── images/ // 图标资源
├── icon16.png
├── icon32.png
├── icon48.png
└── icon128.png
```

## 开发说明

本扩展使用原生 JavaScript 开发，主要依赖：

- Chrome Extension API
- SheetJS (xlsx) 用于 Excel 导出

## License

MIT License

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request
