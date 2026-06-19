# 个人博客/外贸独立站

一个基于 Astro + TypeScript 构建的双语个人博客和外贸产品展示独立站。

## 特性

-  支持中英文双语切换
-  博客文章系统（MDX 支持）
-  产品展示系统
-  响应式设计（手机/平板/桌面）
-  SEO 优化
-  快速加载（静态生成）

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Astro 5.x |
| 语言 | TypeScript |
| 样式 | Tailwind CSS |
| UI组件 | shadcn/ui |
| 图标 | Lucide React |
| 国际化 | astro-i18next |
| 内容 | MD/MDX + Content Collections |

## 项目结构

```
my-site/
├── public/                 # 静态资源
│   ├── images/            # 图片资源
│   │   ├── products/      # 产品图片
│   │   └── posts/         # 博客图片
│   └── favicon.svg
├── src/
│   ├── components/         # 组件
│   │   ├── ui/            # 基础UI组件
│   │   ├── layout/        # 布局组件
│   │   ├── products/      # 产品相关组件
│   │   └── blog/          # 博客相关组件
│   ├── layouts/           # 页面布局
│   │   ├── Layout.astro
│   │   └── BlogPost.astro
│   ├── pages/             # 路由页面
│   │   ├── index.astro    # 首页
│   │   ├── about.astro    # 关于页面
│   │   └── [lang]/        # 国际化路由
│   │       ├── index.astro
│   │       ├── blog/
│   │       │   ├── index.astro
│   │       │   └── [...slug].astro
│   │       └── products/
│   │           ├── index.astro
│   │           └── [...slug].astro
│   ├── content/           # 内容集合
│   │   ├── posts/         # 博客文章
│   │   └── products/      # 产品数据
│   ├── i18n/              # 国际化
│   │   ├── en.json
│   │   └── zh.json
│   ├── styles/
│   │   └── global.css
│   └── utils/
│       └── helpers.ts
├── astro.config.mjs
├── tailwind.config.mjs
└── package.json
```

## 快速开始

### 1. 环境要求

- Node.js 18+
- npm 或 pnpm

### 2. 创建项目

```bash
# 创建 Astro 项目
npm create astro@latest . -- --template basics --typescript strict

# 安装依赖
npm install
```

### 3. 安装样式系统

```bash
# 安装 Tailwind CSS
npm install tailwindcss @tailwindcss/vite

# 初始化 shadcn/ui
npx shadcn@latest init

# 安装常用组件
npx shadcn add button card badge dialog separator sheet
```

### 4. 安装其他依赖

```bash
# 图标
npm install lucide-react

# 国际化
npm install astro-i18next

# MDX 支持
npx astro add mdx
```

### 5. 配置 Tailwind CSS

创建 `src/styles/global.css`:

```css
@import "tailwindcss";

@config "../../tailwind.config.mjs";
```

配置 `astro.config.mjs`:

```javascript
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  }
});
```

### 6. 配置 astro-i18next

创建 `astro-i18next.config.mjs`:

```javascript
/** @type {import('astro-i18next').AstroI18nextConfig} */
export default {
  defaultLocale: "zh",
  locales: ["zh", "en"],
  routes: {
    zh: {
      about: "关于",
      blog: "博客",
      products: "产品"
    },
    en: {
      about: "about",
      blog: "blog",
      products: "products"
    }
  }
};
```

### 7. 配置 Content Collections

创建 `src/content/config.ts`:

```typescript
import { defineCollection, z } from 'astro:content';

const postsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    tags: z.array(z.string()).optional(),
    coverImage: z.string().optional(),
  }),
});

const productsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    price: z.string(),
    images: z.array(z.string()),
    category: z.string(),
    specs: z.record(z.string()).optional(),
  }),
});

export const collections = {
  posts: postsCollection,
  products: productsCollection,
};
```

### 8. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:4321

## 添加内容

### 博客文章

在 `src/content/posts/zh/` 或 `src/content/posts/en/` 创建 `.mdx` 文件:

```yaml
---
title: "文章标题"
description: "文章描述"
pubDate: 2024-06-19
tags: ["标签1", "标签2"]
coverImage: /images/posts/post1-cover.jpg
---

文章内容支持 **Markdown** 格式。
```

### 产品

在 `src/content/products/zh/` 或 `src/content/products/en/` 创建 `.mdx` 文件:

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
specs:
  规格1: "参数1"
  规格2: "参数2"
---

产品详细介绍...
```

## 构建与部署

### 本地构建

```bash
npm run build
```

构建输出在 `dist/` 目录。

### 部署到 Vercel

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

### 部署到 Netlify

```bash
# 安装 Netlify CLI
npm i -g netlify-cli

# 部署
netlify deploy --prod --dir=dist
```

## 自定义配置

### 站点信息

在 `src/consts.ts` 中修改:

```typescript
export const SITE = {
  name: '你的站点名称',
  description: '站点描述',
  url: 'https://your-domain.com',
  email: 'contact@example.com',
};
```

### 导航链接

在 `src/i18n/zh.json` 和 `src/i18n/en.json` 中配置导航文本。

## 注意事项

1. 图片资源放在 `public/images/` 目录
2. 内容文件使用 Frontmatter 格式
3. 多语言内容需要分别在 `zh/` 和 `en/` 目录创建
4. 修改 `astro.config.mjs` 中的 `site` 配置为你的域名

## License

MIT
