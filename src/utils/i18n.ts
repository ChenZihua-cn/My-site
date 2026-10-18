export type Lang = 'zh' | 'en';

/**
 * 站点按目录格式输出（`/zh/blog/welcome/`），内部链接必须带尾斜杠，
 * 否则线上每次点击都会先吃一个 301 才到真正页面。
 */
export function localePath(lang: Lang, path = ''): string {
  const clean = path.replace(/^\/+|\/+$/g, '');
  return clean ? `/${lang}/${clean}/` : `/${lang}/`;
}
