# 个人博客 / 独立站

基于 Astro 6 + Tailwind CSS v4 构建的双语个人博客和产品展示站点。

## 特性

- 中英文双语支持（文件路由 + 中间件自动跳转）
- 启动页动画（黑洞视界效果 + 8-bit 音乐 + 自动跳转）
- 博客文章系统（MDX，标签筛选）
- 产品展示系统（分类筛选、规格表）
- 亮色 / 暗色主题切换
- 文章目录（Table of Contents）
- 响应式设计
- SEO 优化
- 静态生成，快速加载

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Astro 6.x |
| 样式 | Tailwind CSS v4 |
| 图标 | 内联 SVG |
| 国际化 | 文件路由 + 中间件 |
| 内容 | MDX + Content Collections（glob loader） |

## 项目结构

```
my-site/
├── public/
│   ├── favicon.svg
│   ├── CNAME                     # GitHub Pages 自定义域名
│   └── images/
│       ├── products/           # 产品图片
│       └── posts/              # 博客配图
├── src/
│   ├── components/
│   │   ├── ui/                 # Button, Card, ThemeToggle
│   │   ├── layout/             # Navbar, Footer, LanguageSwitcher
│   │   ├── home/               # Hero
│   │   ├── products/           # ProductCard
│   │   └── blog/               # PostCard, TableOfContents
│   ├── layouts/
│   │   └── Layout.astro        # 全局布局（HTML 壳）
│   ├── pages/
│   │   ├── index.astro         # 根路径启动页（黑洞动画 + 倒计时跳转）
│   │   ├── zh/                 # 中文路由
│   │   │   ├── index.astro
│   │   │   ├── about.astro
│   │   │   ├── 404.astro
│   │   │   ├── blog/
│   │   │   │   ├── index.astro
│   │   │   │   └── [...slug].astro
│   │   │   └── products/
│   │   │       ├── index.astro
│   │   │       └── [...slug].astro
│   │   └── en/                 # 英文路由
│   │       ├── index.astro
│   │       ├── about.astro
│   │       ├── 404.astro
│   │       ├── blog/
│   │       │   ├── index.astro
│   │       │   └── [...slug].astro
│   │       └── products/
│   │           ├── index.astro
│   │           └── [...slug].astro
│   ├── content/
│   │   ├── posts/
│   │   │   ├── zh/             # 中文博客文章
│   │   │   └── en/             # 英文博客文章
│   │   └── products/
│   │       ├── zh/             # 中文产品
│   │       └── en/             # 英文产品
│   ├── i18n/
│   │   ├── zh.json             # 中文翻译
│   │   └── en.json             # 英文翻译
│   ├── styles/
│   │   ├── global.css          # 入口：Tailwind + Plugin + @theme + 各模块导入
│   │   ├── tokens.css          # 设计令牌：颜色、间距 — 明/暗双模式（OKLCH）
│   │   ├── base.css            # 基础样式：body、滚动条、文本选中
│   │   ├── animations.css      # 动画：keyframes + 工具类 + stagger
│   │   ├── components.css      # 组件样式：渐变背景、玻璃态、卡片、按钮
│   │   └── typography.css      # 排版：prose 增强 + 目录高亮
│   ├── content.config.ts       # Content Collections 定义
│   ├── consts.ts               # 站点常量（名称、链接等）
│   └── middleware.ts           # 语言检测 + 自动跳转
├── astro.config.mjs
├── tsconfig.json
└── package.json
```

## 快速开始

### 1. 环境要求

- Node.js 18+
- npm

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:4321

### 4. 构建

```bash
npm run build
```

构建输出在 `dist/` 目录。

## 添加内容

### 博客文章

在 `src/content/posts/zh/` 或 `src/content/posts/en/` 下创建 `.mdx` 文件：

```yaml
---
title: "文章标题"
description: "文章描述"
pubDate: 2024-06-19
tags: ["标签1", "标签2"]
coverImage: /images/posts/post1-cover.jpg
---

文章内容支持 Markdown 格式。
```

### 产品

在 `src/content/products/zh/` 或 `src/content/products/en/` 下创建 `.mdx` 文件：

```yaml
---
id: product-001
name: "产品名称"
description: "产品简介"
price: "¥1000"
images:
  - /images/products/p1-1.jpg
  - /images/products/p1-2.jpg
category: "产品分类"
featured: false
---

产品详细介绍...
```

## 站点配置

### 站点信息

在 [src/consts.ts](src/consts.ts) 中修改站点名称、描述、联系方式等。

### 导航链接

在 [src/consts.ts](src/consts.ts) 中修改 `NAV_LINKS`。

### 页面翻译

在 [src/i18n/zh.json](src/i18n/zh.json) 和 [src/i18n/en.json](src/i18n/en.json) 中修改界面文案。

### 主题

亮色 / 暗色主题的 CSS 变量定义在 [src/styles/tokens.css](src/styles/tokens.css) 的 `:root` 和 `[data-theme="dark"]` 中，可修改 `--hue` 变量更换主题色系。

## 部署

站点托管在 GitHub Pages。Push 到 `main` 分支后，GitHub Actions 自动构建并部署：

1. Checkout → 安装依赖（`npm ci`）→ `npm run build`
2. 上传 `dist/` 构建产物（`actions/upload-pages-artifact`）
3. `actions/deploy-pages` 发布到 GitHub Pages

PR 到 `main` 也会触发构建检查，但不会部署。

自定义域名通过 `public/CNAME` 绑定（`luv2u.cn`），域名 DNS 需配置 CNAME 记录指向 `<username>.github.io`。

详见 [.github/workflows/ci.yml](.github/workflows/ci.yml)。

### 其他平台

也可部署到 Vercel / Netlify：

```bash
# Vercel
npm i -g vercel && vercel --prod

# Netlify
npm i -g netlify-cli && netlify deploy --prod --dir=dist
```

## License

GNU GENERAL PUBLIC LICENSE
                       Version 3, 29 June 2007