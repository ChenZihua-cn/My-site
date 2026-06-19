export const SITE = {
  name: 'My Site',
  nameZh: '我的网站',
  description: 'A personal blog and product showcase',
  descriptionZh: '个人博客和产品展示',
  url: 'https://your-domain.com',
  email: 'contact@example.com',
  github: 'https://github.com/yourusername',
  twitter: 'https://twitter.com/yourusername',
} as const;

export const NAV_LINKS = {
  zh: [
    { href: '/', label: '首页' },
    { href: '/products', label: '产品' },
    { href: '/blog', label: '博客' },
    { href: '/about', label: '关于' },
  ],
  en: [
    { href: '/en', label: 'Home' },
    { href: '/en/products', label: 'Products' },
    { href: '/en/blog', label: 'Blog' },
    { href: '/en/about', label: 'About' },
  ],
} as const;
