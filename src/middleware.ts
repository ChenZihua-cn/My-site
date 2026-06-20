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

  // Skip paths that already have a locale prefix
  if (pathname.startsWith('/zh') || pathname.startsWith('/en')) {
    return next();
  }

  // Skip static assets by file extension
  if (/\.\w{2,8}$/.test(pathname)) {
    return next();
  }

  // Root path: detect language; other paths: redirect to zh version
  const prefix =
    pathname === '/'
      ? `/${getPreferredLocale(context)}/`
      : `/zh${pathname}`;

  const destination = prefix + (search ?? '');

  return context.redirect(destination, 302);
});
