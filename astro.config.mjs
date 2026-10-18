import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // 必须与 GitHub Pages 的自定义域名（www.luv2u.cn）一致：裸域 luv2u.cn 会被
  // GitHub Pages 301 到 www，而 canonical / hreflang / og:url 只能指向返回 200 的最终地址。
  site: 'https://www.luv2u.cn',
  // 构建产物是目录格式（/zh/blog/welcome/），内链统一带尾斜杠，避免线上多一跳 301
  trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [
    mdx(),
    sitemap({
      // 首页是 noindex 的语言选择页，404 不应进 sitemap
      filter: (page) => page !== 'https://www.luv2u.cn/' && !page.includes('/404'),
      i18n: {
        defaultLocale: 'zh',
        locales: { zh: 'zh-CN', en: 'en' },
      },
    }),
  ]
});
