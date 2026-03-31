# X Thread Reader

> 一键提取 X/Twitter 完整 Thread，导出为 Markdown。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![WXT](https://img.shields.io/badge/Built%20with-WXT-blueviolet)](https://wxt.dev)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)](https://developer.chrome.com/docs/extensions/mv3/intro/)

---

## 简介

在 X (Twitter) 上刷到好的 Thread，内容却分散在十几条推文里，既不方便阅读，也难以保存？

**X Thread Reader** 是一个 Chrome 浏览器扩展，点击工具栏图标即可自动抓取完整 Thread，整理为干净的 Markdown，一键复制或下载存档。

## 功能

- **自动识别**：打开推文页面后，插件自动检测是否为 Thread
- **完整抓取**：自动滚动加载，长 Thread 一条不漏
- **实时进度**：弹窗内实时显示提取条数
- **一键导出**：复制 Markdown 到剪贴板，或下载 `.md` 文件
- **图片保留**：自动提取 Thread 中的图片链接并嵌入 Markdown
- **零干扰**：不在页面注入任何悬浮按钮，全程在弹窗中操作
- **双语支持**：界面支持中文（默认）和英文，随浏览器语言自动切换

## 安装

### 从 Chrome Web Store 安装（推荐）

> 即将上架，敬请期待。

### 开发者模式手动安装

1. 克隆本仓库并安装依赖：

   ```bash
   git clone https://github.com/askfanxiaojun/x-thread-reader.git
   cd x-thread-reader
   npm install
   npm run build
   ```

2. 打开 Chrome，进入 `chrome://extensions/`
3. 右上角开启**开发者模式**
4. 点击**加载已解压的扩展程序**，选择 `.output/chrome-mv3` 目录

## 使用方法

1. 打开任意 X/Twitter 推文页面（URL 含 `/status/`）
2. 点击浏览器工具栏中的 **X Thread Reader** 图标
3. 在弹出窗口中点击「**提取 Thread**」
4. 等待自动提取完成后，选择：
   - **复制 Markdown** — 直接复制到剪贴板
   - **下载 .md** — 保存为本地文件

## 开发

```bash
# 安装依赖
npm install

# 开发模式（支持热重载）
npm run dev

# 构建生产版本
npm run build

# 打包为 .zip（用于提交 Chrome Web Store）
npm run zip
```

## 技术栈

| 技术 | 说明 |
|------|------|
| [WXT](https://wxt.dev/) | 浏览器扩展开发框架，基于 Vite |
| TypeScript | 类型安全的 JavaScript |
| Chrome Extension Manifest V3 | 最新扩展规范 |
| Chrome i18n API | 国际化支持（zh_CN / en） |

## 项目结构

```
x-thread-reader/
├── entrypoints/
│   ├── content.ts          # 注入 x.com，监听提取指令
│   ├── background.ts       # Service Worker
│   └── popup/              # 弹窗 UI
│       ├── index.html
│       ├── main.ts
│       └── style.css
├── lib/
│   ├── dom-selectors.ts    # DOM 选择器（集中管理，便于维护）
│   ├── extractor.ts        # Thread 提取核心逻辑
│   ├── scroller.ts         # 自动滚动
│   ├── formatter.ts        # Markdown 格式化
│   └── ui.ts               # Toast 等 UI 工具
├── public/
│   └── _locales/
│       ├── zh_CN/messages.json
│       └── en/messages.json
└── wxt.config.ts
```

## 隐私说明

本扩展**完全在本地运行**，不收集任何用户数据，不向任何第三方服务器发送请求。所有提取和格式化操作均在你的浏览器内完成。

## License

[MIT](LICENSE)
