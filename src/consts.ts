export const SITE = {
  name: "Cyan's Blog",
  nameZh: 'Cyan的个人博客',
  description: "Cyan's personal blog",
  descriptionZh: 'Cyan的个人博客',
  url: 'https://luv2u.cn',
  email: 'cyan_0916@qq.com',
  github: 'https://github.com/ChenZihua-cn',
  twitter: 'https://twitter.com/Chen42036136',
} as const;

// 导航标签的唯一真源是 src/i18n/{zh,en}.json 的 nav.*，这里只放路径，
// href 前缀由 lang 决定（'' → /zh 或 /en）。
export const NAV_LINKS = [
  { key: 'home', path: '' },
  { key: 'products', path: '/products' },
  { key: 'blog', path: '/blog' },
  { key: 'about', path: '/about' },
] as const;
