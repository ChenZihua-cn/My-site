export const SITE = {
  name: 'My Site',
  nameZh: '我的网站',
  description: 'A personal blog and product showcase',
  descriptionZh: '个人博客和产品展示',
  url: 'https://luv2u.cn',
  email: 'cyan_0916@qq.com',
  github: 'https://github.com/ChenZihua-cn',
  twitter: 'https://twitter.com/404.html',
} as const;

export const NAV_LINKS = {
  zh: [
    { href: '/zh', label: '首页' },
    { href: '/zh/products', label: '产品' },
    { href: '/zh/blog', label: '博客' },
    { href: '/zh/about', label: '关于' },
  ],
  en: [
    { href: '/en', label: 'Home' },
    { href: '/en/products', label: 'Products' },
    { href: '/en/blog', label: 'Blog' },
    { href: '/en/about', label: 'About' },
  ],
} as const;
