import type { CollectionEntry } from 'astro:content';
import { SITE } from '../consts';
import type { Lang } from './i18n';

type JsonLdNode = Record<string, unknown>;

const PERSON_ID = `${SITE.url}/#person`;
const WEBSITE_ID = `${SITE.url}/#website`;

const CURRENCY: Record<string, string> = {
  '¥': 'CNY',
  '$': 'USD',
  '€': 'EUR',
  '£': 'GBP',
};

const absoluteUrl = (path: string): string => new URL(path, SITE.url).href;
const inLanguage = (lang: Lang): string => (lang === 'zh' ? 'zh-CN' : 'en');

/** 把多个节点合成一个 @graph，页面只需往 Layout 传一个 jsonLd 对象 */
export function graph(...nodes: JsonLdNode[]): JsonLdNode {
  return { '@context': 'https://schema.org', '@graph': nodes };
}

export function personNode(lang: Lang): JsonLdNode {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: SITE.author,
    url: absoluteUrl(`/${lang}/about/`),
    email: SITE.email,
    sameAs: [SITE.github, SITE.twitter],
  };
}

export function websiteNode(lang: Lang): JsonLdNode {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE.url}/`,
    name: lang === 'zh' ? SITE.nameZh : SITE.name,
    description: lang === 'zh' ? SITE.descriptionZh : SITE.description,
    inLanguage: ['zh-CN', 'en'],
    publisher: { '@id': PERSON_ID },
  };
}

export function articleNode({
  post,
  lang,
  path,
}: {
  post: CollectionEntry<'posts'>;
  lang: Lang;
  path: string;
}): JsonLdNode {
  const { data } = post;
  const node: JsonLdNode = {
    '@type': 'BlogPosting',
    headline: data.title,
    description: data.description,
    datePublished: data.pubDate.toISOString(),
    dateModified: (data.updatedDate ?? data.pubDate).toISOString(),
    inLanguage: inLanguage(lang),
    author: { '@id': PERSON_ID },
    publisher: { '@id': PERSON_ID },
    mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(path) },
  };
  if (data.coverImage) node.image = absoluteUrl(data.coverImage.src);
  if (data.tags.length > 0) node.keywords = data.tags.join(', ');
  return node;
}

export function productNode({
  product,
  path,
}: {
  product: CollectionEntry<'products'>;
  path: string;
}): JsonLdNode {
  const { data } = product;
  const node: JsonLdNode = {
    '@type': 'Product',
    name: data.name,
    description: data.description,
    sku: data.id,
    category: data.category,
    url: absoluteUrl(path),
  };
  if (data.images.length > 0) node.image = data.images.map((image) => absoluteUrl(image.src));

  const offer = parseOffer(data.price);
  if (offer) node.offers = offer;

  if (data.specs && Object.keys(data.specs).length > 0) {
    node.additionalProperty = Object.entries(data.specs).map(([name, value]) => ({
      '@type': 'PropertyValue',
      name,
      value,
    }));
  }
  return node;
}

export function breadcrumbNode(items: Array<{ name: string; path: string }>): JsonLdNode {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/**
 * price 是自由格式文案（"¥18 / 6 颗 起"、"from $3.20 / box of 6"），
 * 抽不出合法金额时返回 null —— 宁可不输出 offers，也不给搜索引擎非法价格。
 */
function parseOffer(price: string | undefined): JsonLdNode | null {
  if (!price) return null;

  const match = /([¥$€£])\s?([\d,]+(?:\.\d+)?)/.exec(price);
  if (!match) return null;

  const value = Number(match[2].replace(/,/g, ''));
  if (!Number.isFinite(value) || value <= 0) return null;

  return {
    '@type': 'Offer',
    price: value,
    priceCurrency: CURRENCY[match[1]],
    availability: 'https://schema.org/InStock',
  };
}
