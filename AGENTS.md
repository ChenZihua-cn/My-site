### 项目说明
- 语言：中文问题，中文回答
- 技术栈：astro

# AGENTS.md

面向在本仓库工作的 coding agent。README.md 讲"这是什么站点"，本文档讲"改代码时必须知道的约束和坑"。

## 项目概览

Astro 7 + Tailwind CSS v4 构建的**纯静态**双语（zh / en）个人博客 + 产品展示站，部署到 GitHub Pages（自定义域名 `luv2u.cn`）。无后端、无环境变量、无框架 hydration。

## 命令

| 目的 | 命令 |
|------|------|
| 安装依赖 | `npm ci`（或 `npm install`） |
| 开发服务器 | `npm run dev` → http://localhost:4321 |
| **验证改动** | `npm run build` |
| 预览构建产物 | `npm run preview` |

- **本项目没有测试框架、没有 lint、没有 formatter，`node_modules/.bin` 里也没有 `astro check`。** 不要假装运行了不存在的检查。唯一可靠的验证是 `npm run build`（会同时校验 zod content schema 与 TS 类型）。
- 改 UI 后应实际起 dev server 在浏览器里看效果，构建通过 ≠ 视觉正确。
- 基线：`npm run build` 生成 21 个页面（含 `dist/404.html`），约 1s，当前干净通过。

## 双语架构（最容易改漏的地方）

- 每个页面在 `src/pages/zh/` 和 `src/pages/en/` 各有一份**镜像文件**（index / about / 404 / blog/index / blog/[...slug] / products/index / products/[...slug]）。**改一处必须同步另一处**，否则两种语言的行为会静默分叉。
- `src/middleware.ts`：偏好语言解析顺序为 cookie `preferred-language` → `Accept-Language` → 默认 `zh`；给无语言前缀的路径 302 到 `/zh...`；`/` 不重定向（交给启动页）；`/404` 与 `/404/` 不重定向；按扩展名 `\.\w{2,8}$` 跳过静态资源。
- ⚠️ middleware **只在构建期对每个路由生效**，线上 GitHub Pages 完全不执行它。构建期它会对无语言前缀的路由生成一个 meta-refresh 跳转存根（`Redirecting from /xxx/ to /zh/xxx/`）而不是真实页面——这就是 `/404` 必须加白名单的原因：`dist/404.html` 必须是自己的页面，否则语言兜底逻辑会被存根替换掉。新增任何无语言前缀的顶层路由时，先想清楚它会不会被改写成 `/zh...`。
- 线上语言兜底靠 `src/pages/404.astro`（产出 `dist/404.html`）：GitHub Pages 对所有未命中路径返回它，页面内 `is:inline` 脚本按 cookie → `navigator.languages` 决定跳 `/zh...` 还是 `/en...`，并用 `location.replace` 且对已带前缀/带扩展名的路径直接 return 以避免自我循环。改这段逻辑必须保持"不重定向已带前缀的路径"，否则 404 页会死循环。该页**故意不挂 Navbar/Footer**（两者 `lang` 默认 `zh`，会给 `/en` 下的错拼路径套上中文外壳），且重定向 `<script is:inline>` 必须写在 `<Layout>` **内部**，否则产出位置落到 `</html>` 之后。
- i18n 文案：`src/i18n/zh.json` 与 `src/i18n/en.json`，页面用法固定为
  ```ts
  import translations from '../../i18n/zh.json';
  const t = translations;   // 模板里写 {t.nav.home}
  ```
  **两份 JSON 的 key 必须完全一致**（当前各 38 个，扁平后逐一对应）。新文案一律加进这两个文件，不要在三元表达式里就地写死——`Navbar` / `Footer` / `ThemeToggle` / `TableOfContents` 里曾经有 19 处硬编码，已全部收敛到该约定。
- 导航标签只有一个真源：`src/consts.ts` 的 `NAV_LINKS` 只放 `{ key, path }`，`Navbar` 用 `t.nav[key]` 取文字。**不要把 label 写回 consts**，那会和 `nav.*` 形成双源漂移。`LanguageSwitcher` 里的 `'中文'/'EN'` 是语言自称（不翻译），属例外。
- 组件里取文案的写法固定为（组件只有 `lang` prop，页面不会把 JSON 传进来）：
  ```ts
  import zhTranslations from '../../i18n/zh.json';
  import enTranslations from '../../i18n/en.json';
  const t = lang === 'zh' ? zhTranslations : enTranslations;
  ```
  唯一例外是 `Hero.astro`：它由页面把 `catNiang={t.catNiang}` 作为 prop 传进去。
- 组件靠 prop 拿语言：`lang?: 'zh' | 'en'`（Navbar / Footer / PostCard / TableOfContents / LanguageSwitcher），页面里显式传 `<Navbar lang="zh" />`。日期等本地化用 `new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'zh-CN', …)`。

## Content Collections

- schema 集中在 `src/content.config.ts`（glob loader + zod）。加字段改这里，不要往 frontmatter 里塞 schema 没声明的字段——**校验失败会直接 build 报错**。
  - `posts`：`title` / `description` / `pubDate` 必填，`updatedDate?`，`tags`（默认 `[]`），`coverImage?`。
  - `products`：`id` / `name` / `description` / `category` 必填，`price?`，`images`（默认 `[]`），`specs?`（record of string），`featured`（默认 false）。
- 文件位置 `src/content/{posts,products}/{zh,en}/*.mdx`。**文件名即 URL slug**，zh / en 同名文件互为译本（`welcome.mdx` → `/zh/blog/welcome` + `/en/blog/welcome`）。
- 页面统一用 `getCollection('posts', ({ id }) => id.startsWith('zh/'))` 过滤、`id.replace('zh/', '')` 生成链接——这是语言隔离的唯一机制，别改成按 frontmatter 字段过滤。
- 图片放 `public/images/posts/`、`public/images/products/`，frontmatter 里用绝对路径 `/images/...`。**引用新图片前先确认文件真的存在**——构建不会检查静态资源路径，线上只会 404。
- 卡片/详情页缺图时用 `components/ui/ImagePlaceholder.astro`（`<ImagePlaceholder class="aspect-[4/3]" />`，class 控制形状），不要写死兜底图片路径；`PostCard` / `ProductCard` / `products/[...slug]` 都已按此约定接好。
- 现状不对称：`cupt-strategy.mdx` 只有中文版。新内容按需决定要不要双语，但别默认"只写一边就行"。
- `scripts/generate-cupt-cover.py` 是用 matplotlib 画某张封面图的一次性离线脚本，不参与构建。

## 样式

- Tailwind v4 **CSS-first，没有 `tailwind.config.js`**。入口 `src/styles/global.css`：`@import "tailwindcss"` + `@plugin "@tailwindcss/typography"` + `@theme{}` + 依次导入 `tokens / base / animations / components / typography`。新模块要加进这个导入链。
- 颜色只用**语义 token**：变量定义在 `src/styles/tokens.css` 的 `:root` / `[data-theme="dark"]`（全 OKLCH），`@theme` 把它们映射成 Tailwind 工具类（`bg-background`、`text-muted-foreground`、`border-border`、`bg-primary/10`…）。不要写死的 hex / `bg-[#xxx]`；换主色系改 `--hue: 250`。
- 复用视觉类在 `components.css`（如 `card-modern`、玻璃态、渐变），prose 增强在 `typography.css`，keyframes + stagger 工具类在 `animations.css`。
- ⚠️ 文章正文颜色**不能只在 `tokens.css` 里改 `--tw-prose-*`**：`@tailwindcss/typography` 把这些变量定义在 `.prose` 元素自己身上，同元素声明压过从 `html` 继承的值，改了也不生效（曾导致暗色正文只有 1.9:1、标题 1.1:1）。正确写法是在 `tokens.css` 用 `--prose-*` 存值，再由 `typography.css` 的 `.prose` 规则映射回 `--tw-prose-*`。新增可继承主题的颜色类（如 `.text-gradient`）要配 `[data-theme="dark"]` 变体，否则暗色下对比度不足。
- 暗色模式：`<html data-theme="dark">` + `localStorage.theme`；`Layout.astro` 里有一段 `is:inline` 脚本在首屏渲染前打标防 FOUC——不要挪动它的位置或改成 module script。
- 图标全部**内联 SVG**，没有引入图标库；字体走 Google Fonts CDN（`Inter`）。

## Astro / TS 代码约定

- 组件签名：脚本顶部 `export interface Props { … }`，随后 `const { a, b = 默认值 } = Astro.props;`。
- 零 hydration：**不使用任何 `client:*` 指令**。交互一律写在组件内 `<script>`（Astro 会打包成 defer 的 ESM），通过 `document.querySelector` + `data-*` 属性挂钩，参考 `LanguageSwitcher.astro`、`ThemeToggle.astro`。
- import 用**相对路径**。`tsconfig.json` 没有路径别名（曾有 `@/* → ./src/*`，因源码从未使用已移除），不要引入别名写法。
- `Layout.astro` 是唯一的 HTML 壳（`<!doctype html>` / head / meta / 字体 / `<slot />`），页面在其内部排 Navbar + main + Footer。
- `Layout` 的 props：`title`（必填）、`description?`、`lang?: 'zh' | 'en'`、`image?`、`type?: 'website' | 'article'`、`noindex?`。**canonical / og:* / twitter:card / hreflang 由 Layout 用 `Astro.site` 自动拼绝对地址生成，页面不要手写这些标签**。页面只需按文章页那样传 `image={post.data.coverImage} type="article"`、产品页传 `image={product.data.images[0]}`；`image` 缺省时 `og:image` 与 `twitter:image` 不输出（`twitter:card` 降级为 `summary`）。
- hreflang 假定 `/zh/...` 与 `/en/...` 镜像都存在。内容不对称时（如 `cupt-strategy` 只有中文版）会输出指向 404 的 hreflang——要么补译本，要么接受，别在 Layout 里做特判。
- `src/utils/` 是空目录（无文件），别以为有工具函数可 import。
- 语言服务器没有配置文件可用；`.astro` 的 TS 类型检查依赖 `astro build` 或 `astro check`（后者未安装）。

## 启动页（特例，别当普通页面改）

`src/pages/index.astro`（路由 `/`）不走 `Layout.astro`：自带完整 HTML、`<style>` 全内置、`robots: noindex`、WebGL2 Schwarzschild 实时光线追踪黑洞（`components/home/BlackHole.astro`）、Web Audio 合成的 8-bit 音乐、倒计时后 `window.location.href` 跳 `/zh` 或 `/en`。这个文件是站点性能/兼容性最敏感的地方，改动后务必在无 WebGL、慢设备、浏览器自动播放策略下想过一遍。

## 部署

- 推 `main` → `.github/workflows/ci.yml`：Node 22 + `npm ci` + `npm run build` → `upload-pages-artifact(dist)` → `deploy-pages`。PR 到 `main` **只构建、不部署**。
- 域名三处必须一致：`public/CNAME`、`astro.config.mjs` 的 `site`、`src/consts.ts` 的 `SITE.url`。换域名要三个一起改。
- `dist/404.html` 由 `src/pages/404.astro` 产出，GitHub Pages 用它兜底所有未命中路径（详见上面「双语架构」的语言跳转逻辑）。`/zh/404` 与 `/en/404` 也各自构建，但线上几乎走不到——未命中路径统一由根 `404.html` 接管。
- GitHub Pages 只对**根 `404.html`** 做自定义 404；`astro build` 若把 `/404` 输出成 `404/index.html` 或被中间件改写成跳转存根，自定义页就失效。改完 404 相关代码后用 `npm run build && head -c 200 dist/404.html` 确认它是页面而不是 `Redirecting to:` 存根。
- `package.json` 的 `overrides: { esbuild: "0.27.2" }` 要和 `allowScripts` 里的 `esbuild@0.27.2` 一起维护：白名单按 `包名@解析版本` 精确匹配，esbuild 的 `postinstall` 靠它放行，升版本时不同步改就会变成未审核项被跳过。不要随手删或升这两处。
- `sharp` 不是直接依赖，由 astro 的 `optionalDependencies`（`^0.35.4`）拉入，是图片处理链路需要的，别当未使用依赖删掉。它 0.35 起已无安装期脚本，因此不需要 `allowScripts` 条目（原先钉的 `sharp@0.34.5` 从未命中实际版本，已删除）。

## Git / 协作约定

- Commit 用 Conventional Commits + 中文描述：`feat: 新增博客…`、`fix: CI 部署…`、`ci:`、`docs:`、`chore(deps):`。
- `.gitattributes` 强制 `* text=auto eol=lf` 并把图片/字体标为 binary——不要改动它，跨平台提交时 CRLF 会污染 diff。
- 依赖由 Dependabot 每周一（Asia/Shanghai）自动升，分组 `astro` / `css` / `types`；手动改依赖要在 PR 里说明原因。
- `.github/PULL_REQUEST_TEMPLATE.md` 要求：本地 `npm run build` 通过、代码风格一致、无遗留调试代码、UI 变更附前后截图。

## 已知不一致 / 待决

- `products` schema 的 `id` 字段前端代码从未读取（slug 取自文件名），填错也不报错——以文件名为准。
- 首页 `<title>` 是 `首页 - {t.home.hero.title}` / `Home - ...`，与其余页面的 `{页面} - {SITE.name}` 格式不一致。
- `SITE.twitter` 指向 `https://twitter.com/Chen42036136`（用户提供的真实账号，不是占位值）。删这个链接前先问。
- `.gitignore` 里有一条本地遗留 `superior-spectrum`（仓库内已无该目录）。
