import { defineMiddleware } from 'astro:middleware';

const LANG_COOKIE = 'preferred-language';
const SUPPORTED = ['zh', 'en'] as const;

function getLocaleFromHeader(request: Request): string | null {
  const header = request.headers.get('Accept-Language');
  if (!header) return null;

  const locales = header
    .split(',')
    .map((entry) => {
      const [tag, qRaw] = entry.trim().split(';');
      const lang = tag?.split('-')[0]?.toLowerCase();
      const q = qRaw ? parseFloat(qRaw.split('=')[1] || '1') : 1;
      return { lang, q };
    })
    .filter((entry) => entry.lang && SUPPORTED.includes(entry.lang as 'zh' | 'en'))
    .sort((a, b) => b.q - a.q);

  return locales[0]?.lang ?? null;
}

function getPreferredLocale(context: Parameters<Parameters<typeof defineMiddleware>[0]>[0]): string {
  const cookieLang = context.cookies.get(LANG_COOKIE)?.value;
  if (cookieLang && SUPPORTED.includes(cookieLang as 'zh' | 'en')) {
    return cookieLang;
  }
  return getLocaleFromHeader(context.request) ?? 'zh';
}

export const onRequest = defineMiddleware((context, next) => {
  const { pathname, search } = context.url;

  // Skip paths that already have a locale prefix. Must stay anchored: a bare
  // startsWith('/zh') would also let unrelated paths like /zhao through.
  if (/^\/(zh|en)(\/|$)/.test(pathname)) {
    return next();
  }

  // Astro 内置路径（dev 的图片优化端点 /_image/、/_server-islands 等）不是页面，
  // 加语言前缀只会变成 /zh/_image/ 这种不存在的地址（dev 下图片会全挂）。
  if (pathname.startsWith('/_')) {
    return next();
  }

  // Skip static assets by file extension
  if (/\.\w{2,8}$/.test(pathname)) {
    return next();
  }

  // Root path: let the splash page handle it (don't redirect)
  if (pathname === '/') {
    return next();
  }

  // /404 is the GitHub Pages fallback; it picks the locale client-side, so it
  // must not be rewritten to /zh/404 (that would emit a redirect stub instead).
  // Prerendering hits this route as "/404/", hence the optional trailing slash.
  if (/^\/404\/?$/.test(pathname)) {
    return next();
  }

  // Other paths without locale prefix: redirect to zh version
  // 带上尾斜杠，与目录格式的最终地址一致（少一次 301）
  const destination = `/zh${pathname.replace(/\/+$/, '')}/${search}`;

  return context.redirect(destination, 302);
});
