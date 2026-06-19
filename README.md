# 个人博客 / 外贸独立站

基于 Astro + Tailwind CSS v4 构建的双语个人博客和外贸产品展示站点。

## 特性

- 中英文双语支持（Astro 内置 i18n 路由）
- 博客文章系统（MDX）
- 产品展示系统
- 亮色 / 暗色主题切换
- 响应式设计
- SEO 优化
- 静态生成，快速加载

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Astro 5.x |
| 样式 | Tailwind CSS v4 |
| 图标 | 内联 SVG |
| 国际化 | Astro i18n（内置） |
| 内容 | MDX + Content Collections |

## 项目结构

```
my-site/
├── public/
│   └── images/
│       ├── products/      # 产品图片
│       └── posts/         # 博客图片
├── src/
│   ├── components/
│   │   ├── ui/            # Button, Card, ThemeToggle
│   │   ├── layout/        # Navbar, Footer, LanguageSwitcher
│   │   ├── products/      # ProductCard
│   │   └── blog/          # PostCard
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   ├── index.astro    # 中文首页
│   │   ├── about.astro    # 中文关于
│   │   ├── blog/
│   │   │   ├── index.astro
│   │   │   └── [...slug].astro
│   │   ├── products/
│   │   │   ├── index.astro
│   │   │   └── [...slug].astro
│   │   └── en/            # 英文路由
│   │       ├── index.astro
│   │       ├── about.astro
│   │       ├── blog/
│   │       └── products/
│   ├── content/
│   │   ├── posts/
│   │   │   ├── zh/        # 中文博客
│   │   │   └── en/        # 英文博客
│   │   └── products/
│   │       ├── zh/        # 中文产品
│   │       └── en/        # 英文产品
│   ├── i18n/
│   │   ├── zh.json
│   │   └── en.json
│   ├── styles/
│   │   └── global.css
│   └── consts.ts
├── astro.config.mjs
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

### 主题

亮色 / 暗色主题的 CSS 变量定义在 [src/styles/global.css](src/styles/global.css) 的 `:root` 和 `[data-theme="dark"]` 中，可修改 `--hue` 变量更换主题色系。

## 部署

### Vercel

```bash
npm i -g vercel
vercel --prod
```

### Netlify

```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

## License

MIT
